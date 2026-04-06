import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const requestId = req.headers['x-request-id'] || uuidv4();
        req.requestId = requestId;

        const { method, url, body } = req;
        const userId = req.user?.id || 'anonymous';
        const start = Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const res = context.switchToHttp().getResponse();
                    this.logger.log(
                        JSON.stringify({
                            requestId,
                            userId,
                            method,
                            url,
                            statusCode: res.statusCode,
                            durationMs: Date.now() - start,
                            timestamp: new Date().toISOString(),
                        }),
                    );
                },
                error: (err) => {
                    this.logger.error(
                        JSON.stringify({
                            requestId,
                            userId,
                            method,
                            url,
                            error: err.message,
                            statusCode: err.status || 500,
                            durationMs: Date.now() - start,
                            timestamp: new Date().toISOString(),
                        }),
                    );
                },
            }),
        );
    }
}
