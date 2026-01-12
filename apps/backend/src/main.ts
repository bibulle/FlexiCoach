/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const express = require('express');
    const publicPath = join(process.cwd(), 'public');

    // Serve static assets first (index.html, JS, CSS, etc.)
    app.use(express.static(publicPath));

    // SPA fallback - serve index.html for all non-API routes that don't match static files
    app.use((req, res, next) => {
      if (!req.path.startsWith('/api') && !req.path.match(/\.\w+$/)) {
        res.sendFile(join(publicPath, 'index.html'));
      } else {
        next();
      }
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
