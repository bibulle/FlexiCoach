/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security: HTTP headers hardening
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': [
                  "'self'",
                  'data:',
                  'https://lh3.googleusercontent.com',
                ],
                'style-src': [
                  "'self'",
                  "'unsafe-inline'",
                  'https://fonts.googleapis.com',
                ],
                'font-src': ["'self'", 'https://fonts.gstatic.com'],
                'connect-src': [
                  "'self'",
                  'https://fonts.gstatic.com',
                  'https://lh3.googleusercontent.com',
                ],
                'script-src-attr': ["'unsafe-inline'"],
              },
            }
          : false,
    }),
  );

  // Security: CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable global exception filter
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const express = require('express');
    const publicPath = join(process.cwd(), 'public');

    // Serve static assets first (index.html, JS, CSS, etc.)
    app.use(express.static(publicPath));

    // SPA fallback - serve index.html for all non-API routes that don't match static files
    app.use(
      (
        req: import('express').Request,
        res: import('express').Response,
        next: import('express').NextFunction,
      ) => {
        if (!req.path.startsWith('/api') && !req.path.match(/\.\w+$/)) {
          res.sendFile(join(publicPath, 'index.html'));
        } else {
          next();
        }
      },
    );
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
