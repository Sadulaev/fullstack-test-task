import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './session.model';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionsService {
  constructor(@InjectModel(Session.name) private sessionModel: Model<SessionDocument>) { }

  async createNewSession(text: string): Promise<Session> {
    try {
      const sessionId = randomUUID()
      console.log(sessionId)
      return new this.sessionModel({ timestamp: new Date(), text: text, sessionId }).save()
    } catch (e) {
      console.log(e)
      throw new HttpException('Ошибка на стороне сервера', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllSessions(): Promise<Session[]> {
    return await this.sessionModel.find().exec()
  }

  async getSessionById(sessionId: string): Promise<Session> {
    return await this.sessionModel.findOne({ sessionId }).exec()
  }

  async updateSession(sessionId: string, text: string): Promise<Session> {
    try {
      return await this.sessionModel.findOneAndUpdate({ sessionId }, { text }, {new: true}).exec()
    } catch (e) {
      console.log(e)
    }
    
  }

  async removeSession(sessionId: string): Promise<DeleteResult> {
    return await this.sessionModel.deleteOne({ sessionId }).exec()
  }
}
