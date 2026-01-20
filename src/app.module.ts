import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HealthModule } from './modules/health/health.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { SpaFallbackMiddleware } from './middleware/spa-fallback.middleware';
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
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request logging middleware to all API routes in development
    if (process.env.NODE_ENV !== 'production') {
      consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }

    // SPA fallback middleware - serves index.html for non-API, non-file routes
    // Must be applied AFTER static file serving
    consumer.apply(SpaFallbackMiddleware).forRoutes('*');
  }
}
