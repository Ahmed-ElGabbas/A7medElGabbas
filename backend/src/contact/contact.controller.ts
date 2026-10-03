import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactSubmissionDto, MarkSubmissionReadDto } from './dto/contact.dto';
import { Public } from '../common/public.decorator';

/**
 * Response shape for the public form.
 *
 * Intentionally carries no identifier: the honeypot path must be
 * indistinguishable from a real submission, and a real id in the success body
 * would give a bot a way to tell the two apart.
 */
interface PublicContactResponse {
  received: true;
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /// Applied to the handler rather than the controller: the limit is for
  /// anonymous form spam, and a class-level guard would also throttle the
  /// admin inbox routes, which share a per-IP key. Nest keys the counter on
  /// controller + handler + IP, so scoping it here keeps GET /submissions and
  /// PATCH .../read unmetered.
  @Public()
  @UseGuards(ThrottlerGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateContactSubmissionDto,
    @Req() request: Request,
  ): Promise<PublicContactResponse> {
    // Awaited on purpose: the row must be committed before the visitor is told
    // it worked, so a database failure surfaces as a real error response instead
    // of a false confirmation. Only the notification inside is fire-and-forget.
    await this.contactService.create(dto, {
      ip: clientIp(request),
      userAgent: request.headers['user-agent'],
    });

    const response: PublicContactResponse = {
      received: true,
      message: 'Thanks for getting in touch — your message has been received.',
    };
    return response;
  }

  /// Admin-only: the global AuthGuard rejects this without a valid session.
  @Get('submissions')
  findAll() {
    return this.contactService.findAll();
  }

  @Patch('submissions/:id/read')
  markRead(@Param('id') id: string, @Body() dto: MarkSubmissionReadDto) {
    return this.contactService.markRead(id, dto);
  }
}

/**
 * The address to rate-limit and hash on.
 *
 * `req.ip` already honours Express's `trust proxy` setting, which is what makes
 * this correct behind Railway's proxy; it is only consulted because the field is
 * nullable. No header is read directly, since a client-controlled X-Forwarded-For
 * would let a bot rotate its identity per request and evade the limit entirely.
 */
function clientIp(request: Request): string | undefined {
  return request.ip ?? undefined;
}