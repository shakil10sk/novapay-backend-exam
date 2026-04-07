import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { requestId?: string; user?: { id?: string } }>();
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req.requestId = requestId;

    const { method, url } = req as Request & { body?: unknown };
    const userId = req.user?.id || 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
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
        error: (err: unknown) => {
          const e = err as Error & { status?: number };
          this.logger.error(
            JSON.stringify({
              requestId,
              userId,
              method,
              url,
              error: e.message,
              statusCode: e.status || 500,
              durationMs: Date.now() - start,
              timestamp: new Date().toISOString(),
            }),
          );
        },
      }),
    );
  }
}
