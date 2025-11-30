import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

import { SessionProvider } from "next-auth/react"

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

export default function RootLayout({children,}: {children: React.ReactNode}, pageProps: {session, ...pageProps}) {
  return (
    <html lang="hu" className={`${inter.className}`}>
      <body className={`overflow-x-hidden`}>
          <SessionProvider session={pageProps.session}>
            {children}
          </SessionProvider>
      </body>
    </html>
  )
}
