"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, BookOpen, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type Capsule } from "@/lib/storage"
import { CapsuleCard } from "@/components/capsule-card"
import { useRouter } from "next/navigation"

export function Library() {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const router = useRouter()

  useEffect(() => {
    loadCapsules()
  }, [])

  const loadCapsules = () => {
    const loaded = storage.getCapsules()
    setCapsules(loaded)
  }

  const handleDelete = (id: string) => {
    storage.deleteCapsule(id)
    loadCapsules()
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          const capsule = storage.importCapsule(content)
          if (capsule) {
            storage.saveCapsule(capsule)
            loadCapsules()
          } else {
            alert("Failed to import capsule. Please check the file format.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleLoadSample = async () => {
    try {
      const response = await fetch("/sample-capsule.json")
      const content = await response.text()
      const capsule = storage.importCapsule(content)
      if (capsule) {
        storage.saveCapsule(capsule)
        loadCapsules()
      }
    } catch (error) {
      console.error("Failed to load sample capsule:", error)
      alert("Failed to load sample capsule")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Learning Library</h2>
          <p className="text-muted-foreground">Create, study, and manage your learning capsules</p>
        </div>
        <div className="flex gap-2">
          {capsules.length === 0 && (
            <Button onClick={handleLoadSample} variant="outline">
              <FileJson className="mr-2 h-4 w-4" />
              Load Sample
            </Button>
          )}
          <Button onClick={handleImport} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => router.push("/author/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Capsule
          </Button>
        </div>
      </div>

      {capsules.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle>No capsules yet</CardTitle>
            <CardDescription>Create your first learning capsule or try the sample</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-2">
            <Button onClick={handleLoadSample} variant="outline">
              <FileJson className="mr-2 h-4 w-4" />
              Load Sample
            </Button>
            <Button onClick={() => router.push("/author/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Capsule
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capsules.map((capsule) => (
            <CapsuleCard key={capsule.id} capsule={capsule} onDelete={handleDelete} onUpdate={loadCapsules} />
          ))}
        </div>
      )}
    </div>
  )
}
