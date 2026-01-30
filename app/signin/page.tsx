"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignInPage() {
  const [name, setName] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    signIn(name.trim())
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-4 text-2xl font-bold">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm">Display name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <div className="flex items-center gap-2">
          <Button type="submit">Sign in</Button>
        </div>
      </form>
    </div>
  )
}
