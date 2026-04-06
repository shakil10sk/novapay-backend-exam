import { TransactionService } from './transaction.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    executeTransfer(dto: CreateTransferDto): Promise<any>;
    executeDomestic(dto: CreateTransferDto): Promise<any>;
    recover(): Promise<void>;
    list(): Promise<import("./entities/transaction.entity").Transaction[]>;
    get(id: string): Promise<import("./entities/transaction.entity").Transaction>;
}
