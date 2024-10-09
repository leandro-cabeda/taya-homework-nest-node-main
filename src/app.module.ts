import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './configs/ormconfig';
import { UserMiddleware } from './get-user-middleware';
import { Customer, Proposal, User } from './entities/entities.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User, Proposal, Customer]),
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
