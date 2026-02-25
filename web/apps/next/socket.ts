'use client';

import { io } from 'socket.io-client';

export const socket = io(process.env.WS_URL || 'http://localhost:3001');