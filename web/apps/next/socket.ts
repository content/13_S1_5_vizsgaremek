'use client';

import { io } from 'socket.io-client';

console.log(process.env.WS_URL);

export const socket = io(process.env.WS_URL || 'https://ws.studifyapp.hu');