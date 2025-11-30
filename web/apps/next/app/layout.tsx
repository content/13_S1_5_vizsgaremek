import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

import NextAuthProvider from './providers/session-provider';

export const metadata: Metadata = {
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
    <html lang="hu" className={`${inter.className}`}>
      <body className={`overflow-x-hidden`}>
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
      </body>
    </html>
  )
}
