"use client"

import React, { useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MyPage() {
  const { user, signOut, signIn } = useAuth() as any
  const [name, setName] = useState(user?.name ?? "")

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">My Page</h1>
        <p className="mb-4">You need to sign in to view account settings.</p>
      </div>
    )
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    signIn(name.trim())
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">My Page</h1>
      <p className="mb-4">Signed in as <strong>{user.name}</strong></p>

      <form onSubmit={handleUpdate} className="flex flex-col gap-3">
        <label className="text-sm">Display name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button type="submit">Update</Button>
          <Button variant="secondary" onClick={() => signOut()}>Sign out</Button>
        </div>
      </form>
    </div>
  )
}
