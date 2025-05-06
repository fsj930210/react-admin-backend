import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

import { BusinessException } from '@/exceptions/business.exception';
import { BasicResponseDto } from '@/dto/response.dto';

interface CustomError {
  readonly status: number;
  readonly statusCode?: number;

  readonly message?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor() {
    this.registerCatchAllExceptionsHook();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { url } = request;

    const status = this.getStatus(exception);
    const message = this.getErrorMessage(exception);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR && !(exception instanceof BusinessException)) {
      Logger.error(exception, undefined, 'Catch');
    } else {
      this.logger.warn(`Error Info：(${status}) ${message} Path: ${decodeURI(url)}`);
    }

    const errorCode =
      exception instanceof BusinessException ? exception.getErrorCode() : `${status}`;

    response.status(status).send(BasicResponseDto.error(errorCode, message));
  }

  getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    } else if (exception instanceof QueryFailedError) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      return (
        (exception as CustomError)?.status ??
        (exception as CustomError)?.statusCode ??
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    } else if (exception instanceof QueryFailedError) {
      return exception.message;
    } else {
      return (
        (exception as any)?.response?.message ??
        (exception as CustomError)?.message ??
        `${exception}`
      );
    }
  }

  registerCatchAllExceptionsHook() {
    process.on('unhandledRejection', (reason) => {
      console.error('unhandledRejection: ', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('uncaughtException: ', err);
    });
  }
}
