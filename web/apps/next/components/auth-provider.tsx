"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { fetchData } from "@/lib/utils"
import { useNotificationProvider } from "./notification-provider"

interface User {
  username: string
  id: number
  skinURL: string
  skinSlim: boolean
  token: string
  razorcoins: number
  rank: string
  clan_name: string
  online_time: number
  email: string
  isLogged: boolean
  regdate: number
  regip: string
  lastlogin: number
  skypvp_kills: number
  skypvp_deaths: number
  nextSpin: number
  isAdmin?: boolean,
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { notify } = useNotificationProvider();

  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const mounted = useRef(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const validateUser = async () => {
      setIsLoading(true);
      
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchData("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if(response.statusCode && response.statusCode === 401) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("token");
        }
        else if(response.statusCode && response.statusCode === 429) {
          console.error("Too many requests, please try again later.");
        }
        else if(response.statusCode && response.statusCode.toString().startsWith("5")) {
          console.error("Server error during authentication");
        }
        else {
          setIsAuthenticated(true);
          
          response.razorcoins = +response.razorcoins;

          setUser(response);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    validateUser()
  }, [pathname])

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    notify(`Sikeres bejelentkezés!`, { type: "success" });
  }

  const logout = () => {
    localStorage.removeItem("token")  
    setUser(null)
    setIsAuthenticated(false)
    notify(`Sikeres kijelentkezés!`, { type: "success" });
  }

  // Public pages that don't require authentication
  const publicPages = ["/", "/leaderboard", "/players"]
  const isPublicPage = publicPages.includes(pathname)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
  }, [isAuthenticated, isPublicPage, router])

  useEffect(() => {
    if(!isLoading && !isPublicPage && !isAuthenticated) {
      notify("Ezt az oldalt nem tekintheted meg!", { type: "error", description: "Először jelentkezz be!" });
      router.push("/");
    }
  }, [pathname, isAuthenticated, isLoading, isPublicPage, notify, router])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}