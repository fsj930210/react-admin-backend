import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCodeEnum } from '../enum/error_code.enum';
import { RESPONSE_SUCCESS_CODE, RESPONSE_SUCCESS_MESSAGE } from '../constants/response.constant';

export class BusinessException extends HttpException {
  private errorCode: string;
  private errorMessage: string;
  constructor(error: ErrorCodeEnum | string) {
    // 如果是非 ErrorEnum
    if (!error.includes(':')) {
      super(
        HttpException.createBody({
          code: RESPONSE_SUCCESS_CODE,
          message: error || RESPONSE_SUCCESS_MESSAGE,
        }),
        HttpStatus.OK,
      );
      this.errorCode = RESPONSE_SUCCESS_CODE;
      return;
    }

    const [code, message] = error.split(':');
    super(
      HttpException.createBody({
        code,
        message,
      }),
      HttpStatus.OK,
    );
    this.errorMessage = message; // 错误信息，用于前端展示
    this.errorCode = code;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
  getErrorMessage(): string {
    return this.errorMessage;
  }
}

export { BusinessException as BizException };
