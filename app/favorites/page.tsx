"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"

export default function FavoritesPage() {
  const { user, favorites } = useAuth()

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">Favorites</h1>
        <p className="mb-4">You need to sign in to view favorites.</p>
        <Link href="/signin">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">{user.name}'s Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-muted-foreground">You haven't added any favorites yet.</p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((id) => (
            <li key={id} className="rounded-md border border-border p-3">{id}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
