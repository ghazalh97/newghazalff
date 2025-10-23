"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { LearnMode } from "@/components/learn-mode"

export default function LearnPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <LearnMode capsuleId={id} />
      </main>
    </div>
  )
}
