import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { catchError, Observable, throwError, timeout, TimeoutError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
/**
 * 超时拦截器
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const maxTimeout = 180000;
    const configTimeout = this.configService.get('app.timeout');
    const resolvedTimeout = configTimeout > maxTimeout ? maxTimeout : configTimeout;
    return next.handle().pipe(
      timeout(resolvedTimeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
