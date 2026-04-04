import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuredOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin:
      configuredOrigins && configuredOrigins.length > 0
        ? configuredOrigins
        : [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5175',
            'http://localhost:5176',
            'http://127.0.0.1:5176',
            'http://localhost:4173',
            'http://127.0.0.1:4173',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
          ],
    credentials: true,
  });

  const fs = require('fs');
  app.use((err: any, req: any, res: any, next: any) => {
    fs.writeFileSync('h:/solveathon/hospital-visit-authorization-escalation-system/global-err.log', err.stack || err.message);
    next(err);
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
