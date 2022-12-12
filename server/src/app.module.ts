import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsModule } from './sessions/sessions.module';

console.log(process.env.MONGO_LINK)

@Module({
  imports: [
    ConfigModule.forRoot(
      {envFilePath: '.example.env'}
    ),
    MongooseModule.forRoot(process.env.MONGO_LINK),
    SessionsModule
  ],
})
export class AppModule {}
