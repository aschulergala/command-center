import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { SpaFallbackController } from './spa-fallback.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api{/*path}'],
    }),
  ],
  // SpaFallbackController must be LAST so API routes are resolved first
  controllers: [AppController, SpaFallbackController],
  providers: [],
})
export class AppModule {}
