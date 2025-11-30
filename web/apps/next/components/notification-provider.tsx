"use client";

import { LucideIcon } from "lucide-react";
import {
    Context,
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type NotificationType = "success" | "error" | "info" | "warning" | undefined;

interface Notification {
    id: string;
    message: string;
    type?: NotificationType;
    duration?: number;
    description?: string;
    icon?: LucideIcon;
}

interface NotificationContextValue {
    notify: (message: string, options?: { type?: NotificationType; icon?: LucideIcon; duration?: number, description?: string }) => void;
}

const getTypeColors = (type: NotificationType) => {
    switch(type) {
        case "success": return "bg-green-700 border-green-600 text-green-200"
        case "error": return "bg-red-800 border-red-600 text-red-200"
        case "info": return "bg-blue-500 border-blue-400 text-blue-200"
        case "warning": return "bg-yellow-400 border-yellow-500 text-yellow-900"
        default: return "bg-zinc-900 border-zinc-800 text-zinc-400"
    }
}

const randomString = (length: number) => {
    return Math.random().toString(36).substring(2, length + 2);
}

const NotificationProviderCtx = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback(
        (message: string, options?: { type?: NotificationType; icon?: LucideIcon, description?: string, duration?: number }) => {
            const id = Date.now().toString() + randomString(5);
            const type = options?.type;
            const duration = options?.duration ?? 3000;
            const icon = options?.icon;
            const description = options?.description || undefined;

            setNotifications((prev) => [...prev, { id, message, icon, type, duration, description }]);

            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }, duration);
        },
        []
    );

    return (
        <NotificationProviderCtx.Provider value={{ notify }}>
            {children}
            <div className="notification-wrapper absolute top-0 right-0 left-0 h-max flex justify-center items-center flex-col space-y-2 pointer-events-none pt-3">
                <AnimatePresence mode="popLayout">
                    {notifications.map((n, index) => (
                        <motion.div
                            key={n.id}
                            layout
                            initial={{
                                opacity: 0,
                                y: -100,
                                scale: 0.8,
                            }}
                                animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: -100,
                                scale: 0.8,
                                transition: {
                                    duration: 0.3,
                                    ease: "easeInOut",
                                },
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 20,
                            }}
                        >
                            <Alert 
                                onClick={() => setNotifications((prev) => prev.filter((notification) => notification.id !== n.id))} 
                                className={`border ${getTypeColors(n.type)} w-[250px] flex items-center justify-center pointer-events-auto py-3 cursor-pointer text-center`}
                            >
                                <div className="flex justify-center items-center gap-3">
                                    {n.icon && <n.icon size={16}/>}
                                    <div className="flex flex-col gap-1">
                                        <AlertTitle className="text-xs font-semibold p-0 m-0">{n.message}</AlertTitle>
                                        {n.description && (
                                            <AlertDescription className="text-xs p-0 m-0">
                                                {n.description}
                                            </AlertDescription>
                                        )}
                                    </div>
                                </div>
                            </Alert>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationProviderCtx.Provider>
    );
};

export const useNotificationProvider = () => useContext(NotificationProviderCtx as Context<NotificationContextValue>);  