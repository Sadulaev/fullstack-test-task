import { io, Socket } from "socket.io-client"
import React, { FormEvent, useEffect, useState } from 'react';
import './Form.css'

type sessionInfo = {
    sessionId: string;
    text: string;
}

let socket: Socket;

const Form = (): JSX.Element => {
    const [socket, setSocket] = useState<Socket>()
    const [text, setText] = useState('')
    const [sessionsList, setSessionsList] = useState<sessionInfo[]>()
    const [currentSession, setCurrentSession] = useState<sessionInfo>()

    //Подключение к серверу 
    useEffect(() => {
        const newSocket = io('http://localhost:5000')
        setSocket(newSocket)
    }, [setSocket])


    useEffect(() => {
        //Первая прогрузка сессий при входе на страницу
        socket?.emit("sessions:get")
        socket?.on("sessions:get", (payload) => {
            setSessionsList(payload.sessions)
        })

        //Тот последним обновил текст будет иметь локальное состояние, а остальные состояние с БД
        socket?.on("session:put", (payload: any): void => {
            if (payload.clientId !== socket.id) {
                setText(payload.session.text)
            }
        })

        //Создание сессии и автоматический вход в нее
        socket?.on("session:post", (payload) => {
            setCurrentSession(payload.session)

        })

        //Вход любую сессию из списка
        socket?.on("session:enter", (payload) => {
            setCurrentSession(payload.session)
            setText(payload.session.text)
            setTimeout(() => console.log(currentSession), 1000)
        })

        //При переходе с одной сессии на другую, сначала происходит выход из первой.
        socket?.on("session:leave", (payload) => {
            setCurrentSession(undefined)
        })

        //В случае удаления текущей комнаты локальные данные обновляются
        socket?.on("session:delete", () => {
            setText('')
            setCurrentSession(undefined)
        })
    }, [socket])

    //Создание новой сессии. Отправляется только текст
    const handleCreateSession = (e: any): void => {
        e.preventDefault()
        if (!text) {
            alert('Ошибка: текст не может быть пустым во время создания сессии')
        } else {
            socket?.emit("session:post", { text })
        }
    }

    //Удаление текущей сесии. Отправляется id сессии
    const handleDeleteSession = (e: any): void => {
        e.preventDefault()
        socket?.emit("session:delete", { sessionId: currentSession?.sessionId })
        setCurrentSession(undefined)
        setText('')
    }

    //Обновление текущей сессии
    const handleUpdateSession = (e: any): void => {
        setText(e.target.value)
        if (currentSession) {
            socket?.emit("session:put", { sessionId: currentSession.sessionId, text: e.target.value, clientId: socket.id })
        }
    }

    // Вход в новую сессию в 2 шага. 1)Если уже в сессии выход из нее 2)И только потом вход в новую
    const handleEnterNewSession = (session: sessionInfo) => {
        if (currentSession) {
            socket?.emit("session:leave", { sessionId: currentSession.sessionId })
        }
        socket?.emit("session:enter", { sessionId: session.sessionId })
    }
    return (
        <div className="main-block">
            <div className="sessions-list">
                <div>
                    {sessionsList?.map(session => {
                        return <div className="sessions-item" key={session.sessionId}>
                            <p>{session.sessionId}</p>
                            <button onClick={() => handleEnterNewSession(session)}>{currentSession?.sessionId === session.sessionId ? 'Текущая сессия' : 'Подключиться'}</button>
                        </div>
                    })}
                </div>
            </div>
            <form className="activate-form">
                <h1>Создать сессию или присоединиться к сущетсвующей</h1>
                <input className='activate-form__text' type="text" value={text} onChange={(e) => handleUpdateSession(e)} />
                {currentSession
                    ?
                    <button className='activate-form__btn' onClick={(e) => { handleDeleteSession(e) }}>Удалить сессию</button>
                    :
                    <button className='activate-form__btn' onClick={(e) => { handleCreateSession(e) }}>Создать сессию</button>
                }
            </form>
        </div>
    );
};

export default Form;