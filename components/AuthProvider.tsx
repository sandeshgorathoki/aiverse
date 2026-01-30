"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type User = { name: string } | null

type AuthContextValue = {
  user: User
  signIn: (name: string) => void
  signOut: () => void
  favorites: string[]
  toggleFavorite: (id: string) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: () => {},
  signOut: () => {},
  favorites: [],
  toggleFavorite: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("ai_user")
      const rawFav = localStorage.getItem("ai_favorites")
      if (rawUser) setUser(JSON.parse(rawUser))
      if (rawFav) setFavorites(JSON.parse(rawFav))
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("ai_user", JSON.stringify(user))
      localStorage.setItem("ai_favorites", JSON.stringify(favorites))
    } catch (e) {
      // ignore
    }
  }, [user, favorites])

  function signIn(name: string) {
    setUser({ name })
  }

  function signOut() {
    setUser(null)
    setFavorites([])
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, favorites, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthProvider
