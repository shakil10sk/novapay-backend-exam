import { Test, TestingModule } from '@nestjs/testing';
import { FxService } from './fx.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FxQuote, QuoteStatus } from './entities/fx-quote.entity';
import { MetricsService } from '../metrics/metrics.service';

describe('FxService (unit)', () => {
  let service: FxService;
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMetrics = {
    fxProviderFailures: { inc: jest.fn() },
    // other metrics are not used in these tests
  } as any as MetricsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxService,
        { provide: getRepositoryToken(FxQuote, 'fxConnection'), useValue: mockRepo },
        { provide: MetricsService, useValue: mockMetrics },
      ],
    }).compile();

    service = module.get<FxService>(FxService);
  });

  it('createQuote: issues quote when provider up', async () => {
    process.env.FX_PROVIDER_STATUS = 'up';
    const dto: any = { baseCurrency: 'USD', quoteCurrency: 'EUR', amount: '100.00', userId: 'user-1' };

    const saved = {
      id: 'q-1',
      baseCurrency: 'USD',
      quoteCurrency: 'EUR',
      rate: '0.92',
      amountBase: '100.00',
      amountQuote: '92.000000',
      status: QuoteStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 60000),
    } as FxQuote;

    mockRepo.create.mockReturnValue(saved);
    mockRepo.save.mockResolvedValue(saved);

    const result = await service.createQuote(dto);
    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'q-1', baseCurrency: 'USD', quoteCurrency: 'EUR' });
  });

  it('getQuote: returns secondsRemaining and updates expired status', async () => {
    const future = new Date(Date.now() + 30000);
    const quote = {
      id: 'q-2',
      baseCurrency: 'USD',
      quoteCurrency: 'BDT',
      rate: '110.5',
      amountBase: '10.00',
      amountQuote: '1105.000000',
      status: QuoteStatus.ACTIVE,
      expiresAt: future,
    } as FxQuote;

    mockRepo.findOne.mockResolvedValueOnce(quote);
    const res = await service.getQuote('q-2');
    expect(res.id).toBe('q-2');
    expect(res.secondsRemaining).toBeGreaterThan(0);
  });

  it('consumeQuote: marks quote USED and records transaction id', async () => {
    const quote = {
      id: 'q-3',
      baseCurrency: 'USD',
      quoteCurrency: 'NGN',
      rate: '1580.0',
      amountBase: '1.00',
      amountQuote: '1580.000000',
      status: QuoteStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 30000),
    } as FxQuote;

    mockRepo.findOne.mockResolvedValueOnce(quote);
    mockRepo.save.mockImplementation(async (q) => ({ ...q }));

    const consumed = await service.consumeQuote('q-3', 'txn-123');
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'q-3' } });
    expect(mockRepo.save).toHaveBeenCalled();
    expect(consumed.status).toBe(QuoteStatus.USED);
    expect(consumed.usedByTransactionId).toBe('txn-123');
  });

  it('createQuote: throws when FX provider is down', async () => {
    process.env.FX_PROVIDER_STATUS = 'down';
    const dto: any = { baseCurrency: 'USD', quoteCurrency: 'EUR', amount: '5.00', userId: 'user-2' };
    await expect(service.createQuote(dto)).rejects.toThrow();
    expect(mockMetrics.fxProviderFailures.inc).toHaveBeenCalled();
  });
});
