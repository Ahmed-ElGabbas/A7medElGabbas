import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      const body: ErrorBody = {
        statusCode: status,
        message:
          typeof payload === 'string'
            ? payload
            : ((payload as { message?: string | string[] }).message ??
              exception.message),
        error: exception.name,
        path: request.url,
        timestamp: new Date().toISOString(),
      };

      response.status(status).json(body);
      return;
    }

    this.logger.error(
      `Unhandled: ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const body: ErrorBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
