import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { RoutesModule } from '@/routes/routes.module';
import { StopsModule } from '@/stops/stops.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              },
      },
    }),
    PrismaModule,
    RoutesModule,
    StopsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
