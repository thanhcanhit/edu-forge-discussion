import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Kiểm tra xem context có phải là HTTP không
    const isHttp = context.getType() === 'http';
    if (!isHttp) {
      // Nếu không phải HTTP (ví dụ: gRPC, WebSocket), bỏ qua logging
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest<Request>();
    const response: Response = httpContext.getResponse<Response>();

    // Kiểm tra để tránh log các request tĩnh hoặc không cần thiết
    const { method, originalUrl } = request;
    if (
      originalUrl.includes('/favicon.ico') ||
      originalUrl.includes('/health')
    ) {
      return next.handle(); // Bỏ qua các request như favicon hoặc health check
    }

    const startTime: number = Date.now();
    this.logger.log(`Request: [${method}] ${originalUrl}`);

    return next.handle().pipe(
      tap(() => {
        const duration: number = Date.now() - startTime;
        const statusCode: number = response.statusCode;
        this.logger.log(
          `Response: [${method}] ${originalUrl} ${statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
