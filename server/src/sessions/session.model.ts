import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SessionDocument = HydratedDocument<Session>

@Schema()
export class Session {
    _id?: string

    @Prop({default: new Date()})
    timestamp: Date;

    @Prop({required: true})
    text: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);