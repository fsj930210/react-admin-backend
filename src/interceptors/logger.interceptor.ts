import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response, Request } from 'express';
/**
 * 日志拦截器，打印请求和响应
 */
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = new Logger(LoggerInterceptor.name, { timestamp: false });

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const call$ = next.handle();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, path, ip, query, params, body, headers } = request;
    const content = `${method} ${path} ${ip}: ${context.getClass().name}->${
      context.getHandler().name
    } invoked...\``;
    const isSse = request.headers.accept === 'text/event-stream';
    this.logger.debug(`======= request ========：${content}`);
    this.logger.debug(
      `query: ${JSON.stringify(query)}, params:${JSON.stringify(params)}, body:${JSON.stringify(body)}, headers: ${JSON.stringify(headers)}`,
    );
    const now = Date.now();

    return call$.pipe(
      tap((res) => {
        if (isSse) return;
        const timeDiff = `${+(Date.now() - now)}ms`;
        this.logger.debug(
          `======= response ========：${method} ${path} ${ip}: status:${response.statusCode}: ${timeDiff}`,
        );
        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      }),
    );
  }
}
