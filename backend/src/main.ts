import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());

  /**
   * Railway terminates TLS and forwards to this process, so without this every
   * request appears to come from the proxy's own address. Two things depend on
   * the real client address: the POST /contact rate limit, which would otherwise
   * collapse every visitor on the site into a single shared quota, and the IP
   * digest stored on a submission.
   *
   * A numeric trust of 1 means "trust exactly one hop": the proxy's appended
   * address is used and a client-supplied X-Forwarded-For cannot spoof its way
   * past the limit. If the topology ever gains a second proxy, raise this to the
   * hop count rather than switching to `true`.
   */
  app.set('trust proxy', 1);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const origins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length > 0 ? origins : false,
    credentials: true,
  });

  app.enableShutdownHooks();

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);

  new Logger('Bootstrap').log(`API listening on http://localhost:${port}`);
}

void bootstrap();
