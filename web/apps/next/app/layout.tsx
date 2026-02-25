import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

import NextAuthProvider from './providers/session-provider';
import { NotificationProvider } from "@/components/notification-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SocketProvider } from "@/components/socket-provider";

export const metadata: Metadata = {
  title: "Studify - Az okos tanulási társ",
  description: "Studify",
  keywords: ["Studify", "Learning", "Education", "Productivity"],
  authors: [
    { name: "Fülöp Miklós János"}, 
    { name: "Vadkerti-Tóth Ádám" }
  ],
  icons: "/logo.png"
}

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({children,}: {children: React.ReactNode}) {
  return (
    <html lang="hu" className={`${inter.className}`} suppressHydrationWarning>
      <body className={`overflow-x-hidden`}>
          <NextAuthProvider>
            <ThemeProvider 
              attribute="class"
              defaultTheme="system" 
              enableSystem
              disableTransitionOnChange
            >
              <NotificationProvider>
                <SocketProvider>
                  {children}
                </SocketProvider>
              </NotificationProvider>
            </ThemeProvider>
          </NextAuthProvider>
      </body>
    </html>
  )
}