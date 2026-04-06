import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { IdempotencyKey, IdempotencyStatus } from './entities/idempotency-key.entity';
import { MetricsService } from '../metrics/metrics.service';
import { AccountService } from '../account/account.service';
import { LedgerService } from '../ledger/ledger.service';
import { FxService } from '../fx/fx.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('TransactionService (unit)', () => {
  let service: TransactionService;

  const mockTxnRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  } as any;

  const mockIdempRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  } as any;

  const mockAccount = {
    getWalletById: jest.fn(),
    updateBalanceSnapshot: jest.fn().mockResolvedValue(undefined),
  } as any as AccountService;

  const mockLedger = {
    getBalance: jest.fn(),
    postDoubleEntry: jest.fn(),
    getEntriesByTransaction: jest.fn(),
  } as any as LedgerService;

  const mockFx = {
    getQuote: jest.fn(),
    consumeQuote: jest.fn(),
  } as any as FxService;

  const mockMetrics = {
    transactionTotal: { inc: jest.fn() },
    transactionFailed: { inc: jest.fn() },
    idempotencyHits: { inc: jest.fn() },
  } as any as MetricsService;

  const mockConfig = {
    get: jest.fn().mockReturnValue('24'),
  } as any as ConfigService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: getRepositoryToken(Transaction, 'transactionConnection'), useValue: mockTxnRepo },
        { provide: getRepositoryToken(IdempotencyKey, 'transactionConnection'), useValue: mockIdempRepo },
        { provide: AccountService, useValue: mockAccount },
        { provide: LedgerService, useValue: mockLedger },
        { provide: FxService, useValue: mockFx },
        { provide: MetricsService, useValue: mockMetrics },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('executeTransfer: throws on insufficient funds', async () => {
    // idempotency key not found -> created normally
    mockIdempRepo.findOne.mockResolvedValue(null);
    mockIdempRepo.create.mockReturnValue({});
    mockIdempRepo.save.mockResolvedValue({ id: 'ik-1', status: IdempotencyStatus.PROCESSING });

    // wallets
    mockAccount.getWalletById.mockResolvedValueOnce({ id: 'w-1', currency: 'USD', ownerName: 'A' });
    mockAccount.getWalletById.mockResolvedValueOnce({ id: 'w-2', currency: 'USD', ownerName: 'B' });

    mockLedger.getBalance.mockResolvedValue({ balance: 0 });

    const dto: any = { senderWalletId: 'w-1', receiverWalletId: 'w-2', amount: 10, currency: 'USD', idempotencyKey: 'key-1' };

    await expect(service.executeTransfer(dto)).rejects.toThrow(BadRequestException);
    expect(mockIdempRepo.save).toHaveBeenCalled();
  });

  it('executeTransfer: completes a domestic transfer', async () => {
    mockIdempRepo.findOne.mockResolvedValue(null);
    mockIdempRepo.create.mockReturnValue({});
    mockIdempRepo.save.mockResolvedValue({ id: 'ik-2', status: IdempotencyStatus.PROCESSING });

    mockAccount.getWalletById.mockResolvedValueOnce({ id: 'w-1', currency: 'USD', ownerName: 'Alice' });
    mockAccount.getWalletById.mockResolvedValueOnce({ id: 'w-2', currency: 'USD', ownerName: 'Bob' });

    mockLedger.getBalance.mockResolvedValue({ balance: 100 });

    const savedTxn = { id: 'txn-1', status: TransactionStatus.PENDING } as Transaction;
    mockTxnRepo.create.mockReturnValue(savedTxn);
    mockTxnRepo.save.mockResolvedValue(savedTxn);

    mockLedger.postDoubleEntry.mockResolvedValue(undefined);
    mockTxnRepo.save.mockResolvedValueOnce(savedTxn).mockResolvedValueOnce({ ...savedTxn, status: TransactionStatus.COMPLETED });

    const dto: any = { senderWalletId: 'w-1', receiverWalletId: 'w-2', amount: 10, currency: 'USD', idempotencyKey: 'key-2' };

    const res = await service.executeTransfer(dto);
    expect(mockLedger.postDoubleEntry).toHaveBeenCalled();
    expect(res.status).toBe(TransactionStatus.COMPLETED);
  });

  it('executeTransfer: rejects concurrent processing (conflict) when key locked', async () => {
    mockIdempRepo.findOne.mockResolvedValue({ key: 'key-3', status: IdempotencyStatus.PROCESSING, payloadHash: 'h' });
    const dto: any = { senderWalletId: 'w-1', receiverWalletId: 'w-2', amount: 1, currency: 'USD', idempotencyKey: 'key-3' };
    await expect(service.executeTransfer(dto)).rejects.toThrow(ConflictException);
    expect(mockMetrics.idempotencyHits.inc).toHaveBeenCalled();
  });
});
