import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;

  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('corsOrigins')?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.setGlobalPrefix('api');

  await app.listen(port);
  logger.log(`Server running on port ${port}`);
}
bootstrap();
