'use client';

import type { DefaultEventsMap } from '@socket.io/component-emitter';
import { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socket } from '../socket';
import { useNotificationProvider } from './notification-provider.jsx';
import {  } from '@studify/types';
import { redirect } from 'next/navigation';

type SocketProviderProps = {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | undefined;
    isConnected: boolean;

    id?: string;

    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
};

const SocketProviderCtx = createContext<SocketProviderProps>({} as SocketProviderProps);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { notify } = useNotificationProvider();

    const [isConnected, setIsConnected] = useState(false);
    const [id, setId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (socket.connected && !isConnected) {
            onConnect();
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [isConnected]);

    function onConnect() {
        setIsConnected(true);
        setId(socket.id);
        console.log(`Connected to server with id: ${socket.id}`);
    }

    function onDisconnect() {
        setIsConnected(false);
    }

    return (
        <SocketProviderCtx.Provider
            value={{
                socket,
                isConnected,
                id,

                isLoading,
                setIsLoading,
            }}
        >
            {children}
        </SocketProviderCtx.Provider>
    );
};

export const useSocket = () => useContext(SocketProviderCtx);