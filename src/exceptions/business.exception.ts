import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODE_ENUM } from '@/enum/error_code.enum';

export class BusinessException extends HttpException {
  /**
   * 业务错误码
   */
  private readonly errorCode: string;

  constructor(errorCode: ERROR_CODE_ENUM, status = HttpStatus.OK) {
    super(errorCode, status);
    this.errorCode = Object.entries(ERROR_CODE_ENUM)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .find(([_, val]) => val === errorCode)?.[0]
      ?.replace('ERROR_CODE_', '') as string;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
}
