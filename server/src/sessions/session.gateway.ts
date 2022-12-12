import { Logger } from '@nestjs/common/services';
import { WebSocketGateway, WebSocketServer, MessageBody, OnGatewayInit, SubscribeMessage, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'Socket.IO'
import { Session } from './session.model';
import { SessionsService } from './sessions.service'

@WebSocketGateway({
    cors: {
        origin: '*'
    },
})
export class SessionGateway implements OnGatewayInit {
    constructor(private readonly sessionService: SessionsService) { }

    private logger: Logger = new Logger('SessionGateway')

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        this.logger.log('Initialized')
    }

    //Событие: вход в сессию. Возвращает сессию и добавлят пользователя в комнату с названием соответствующим id сессии
    @SubscribeMessage('session:enter')
    async handleEnterToSession(@ConnectedSocket() client: Socket, @MessageBody() payload) {
        client.join(`${payload.sessionId}`)
        const session = await this.sessionService.getSessionById(payload.sessionId)
        client.emit('session:enter', { session })
        // console.log(`client ${client.id} is enterd to room ${payload.sessionId}`)
    }

    //Событие: выход из сессии. Удаляет пользователя из комнаты.
    @SubscribeMessage('session:leave')
    async handleLeaveSession(@ConnectedSocket() client: Socket, @MessageBody() payload) {
        client.leave(`${payload.sessionId}`)
        client.emit('session:leave', { sessionId: payload.sessionId })
    }

    //Событие: создание сессии. Создает новую сессию в БД, возвращает данные сессии и вызывает событие - обновление количества сессий
    @SubscribeMessage('session:post')
    async handleSessionCreate(@ConnectedSocket() client: Socket, @MessageBody() payload): Promise<void> {
        const createdSession = await this.sessionService.createNewSession(payload.text)
        this.handleEnterToSession(client, { sessionId: createdSession.sessionId })
        client.emit('session:post', { session: createdSession })
        this.handleSessionsGet();
    }

    //Событие: обновление данных сессии. Обновляет данные по id сессии и полученному тексту. Возвращает обновленные данные всем в текущей сессии(комнате)
    @SubscribeMessage('session:put')
    async handleSessionPut(@ConnectedSocket() client: Socket, @MessageBody() payload): Promise<void> {
        const updatedSession: Session = await this.sessionService.updateSession(payload.sessionId, payload.text)
        this.server.in(`${payload.sessionId}`).emit("session:put", {session: updatedSession, clientId: client.id})
    }

    //Событе: получение массива из всех сессий.
    @SubscribeMessage("sessions:get")
    async handleSessionsGet(@ConnectedSocket() client?: Socket): Promise<void> {
        const sessions = await this.sessionService.getAllSessions()
        if (client) {
            client.emit('sessions:get', { sessions })
        } else {
            this.server.emit('sessions:get', { sessions })
        }
    }

    //Событие: удаление сессии. Удаляет сессию из БД.
    @SubscribeMessage('session:delete')
    async handleSessionDelete(@ConnectedSocket() client: Socket, @MessageBody() payload): Promise<void> {
        await this.sessionService.removeSession(payload.sessionId)
        this.server.to(`${payload.sessionId}`).emit("session:delete")
        this.handleSessionsGet()
    }
}