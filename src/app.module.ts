import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SpaFallbackController } from './spa-fallback.controller';
import { HealthModule } from './modules/health/health.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api{/*path}'],
    }),
    HealthModule,
  ],
  // SpaFallbackController must be LAST so API routes are resolved first
  controllers: [SpaFallbackController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request logging middleware to all API routes in development
    if (process.env.NODE_ENV !== 'production') {
      consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
  }
}
