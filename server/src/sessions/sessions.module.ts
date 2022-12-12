import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { Session, SessionSchema } from './session.model'
import { SessionGateway } from './session.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Session.name, schema: SessionSchema}]),
  ],
  providers: [SessionGateway, SessionsService]
})
export class SessionsModule {}
