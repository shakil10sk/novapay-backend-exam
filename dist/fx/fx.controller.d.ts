import { FxService } from './fx.service';
import { CreateFxQuoteDto } from './dto/create-fx-quote.dto';
export declare class FxController {
    private readonly fxService;
    constructor(fxService: FxService);
    createQuote(dto: CreateFxQuoteDto): Promise<import("./entities/fx-quote.entity").FxQuote>;
    getQuote(id: string): Promise<import("./entities/fx-quote.entity").FxQuote & {
        secondsRemaining: number;
    }>;
}
