/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const publicPath = join(__dirname, '../../..', 'public');
    app.useStaticAssets(publicPath);
    app.setBaseViewsDir(publicPath);

    // Fallback to index.html for Angular routing
    app.use((req, res, next) => {
      if (!req.path.startsWith('/api')) {
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
