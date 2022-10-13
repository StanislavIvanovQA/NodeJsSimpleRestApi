import {Server} from 'socket.io'

let socket

export const socketIo = {
    init: httpServer => {
        socket = new Server(httpServer, {
            cors: {
                origin: 'http://localhost:3100',
                methods: ['GET', 'POST'],
            },
        })
        return socket
    },
    getSocket: () => {
        if (!socket) {
            throw new Error('Socket does not initialized')
        }
        return socket
    },
}
