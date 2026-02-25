import { Express } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { registerSocketListeners } from './listeners';
import jwt from "jsonwebtoken";
import { User } from '@studify/types';

export const app: Express = require('express')();
app.use(require('cors')());
app.use(require('body-parser').json());

const PORT = 3001;

const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token || typeof token !== "string") {
        return next(new Error("UNAUTHORIZED"));
    }

    try {
        const user = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as User;
        socket.data.user = user;
        next();
    } catch (err) {
        next(new Error("UNAUTHORIZED"));
    }
});

io.on('connection', (socket: Socket) => {
    console.log(`[CONNECTION]: ${socket.id} - total: ${io.engine.clientsCount}`);

    registerSocketListeners(socket);
});