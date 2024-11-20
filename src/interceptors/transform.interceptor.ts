import { CallHandler, NestInterceptor, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { BasicResponseDto } from '@/dto/response.dto';
import { KEEP_KEY } from '@/decorators/keep.decorator';

interface Response<T> {
  data: T;
}

/**
 * 数据转换拦截器，统一处理请求与响应，如果不需要则添加 @Keep装饰器
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const keep = this.reflector.get<boolean>(KEEP_KEY, context.getHandler());
        if (keep) {
          return data;
        } else {
          return BasicResponseDto.success(data);
        }
      }),
    );
  }
}
