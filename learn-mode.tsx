"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { storage, type Capsule } from "@/lib/storage"
import { NotesView } from "@/components/notes-view"
import { FlashcardsView } from "@/components/flashcards-view"
import { QuizView } from "@/components/quiz-view"

interface LearnModeProps {
  capsuleId: string
}

export function LearnMode({ capsuleId }: LearnModeProps) {
  const router = useRouter()
  const [capsule, setCapsule] = useState<Capsule | null>(null)
  const [activeTab, setActiveTab] = useState("notes")

  useEffect(() => {
    const loaded = storage.getCapsule(capsuleId)
    if (loaded) {
      setCapsule(loaded)
      // Set default tab based on available content
      if (!loaded.notes && loaded.flashcards.length > 0) {
        setActiveTab("flashcards")
      } else if (!loaded.notes && loaded.flashcards.length === 0 && loaded.quiz.length > 0) {
        setActiveTab("quiz")
      }
    } else {
      router.push("/")
    }
  }, [capsuleId, router])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "[") {
        const tabs = ["notes", "flashcards", "quiz"]
        const currentIndex = tabs.indexOf(activeTab)
        if (currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1])
        }
      } else if (e.key === "]") {
        const tabs = ["notes", "flashcards", "quiz"]
        const currentIndex = tabs.indexOf(activeTab)
        if (currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1])
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [activeTab])

  const handleExport = () => {
    if (!capsule) return
    const json = storage.exportCapsule(capsule)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${capsule.title.replace(/\s+/g, "-").toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!capsule) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{capsule.title}</h2>
            <p className="text-sm text-muted-foreground">
              {capsule.subject} • {capsule.level}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes" disabled={!capsule.notes}>
            Notes
          </TabsTrigger>
          <TabsTrigger value="flashcards" disabled={capsule.flashcards.length === 0}>
            Flashcards ({capsule.flashcards.length})
          </TabsTrigger>
          <TabsTrigger value="quiz" disabled={capsule.quiz.length === 0}>
            Quiz ({capsule.quiz.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <NotesView notes={capsule.notes} />
        </TabsContent>

        <TabsContent value="flashcards">
          <FlashcardsView capsuleId={capsule.id} flashcards={capsule.flashcards} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizView capsuleId={capsule.id} questions={capsule.quiz} />
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <p>Keyboard shortcuts: [ / ] to switch tabs • Space to flip flashcard</p>
      </div>
    </div>
  )
}
