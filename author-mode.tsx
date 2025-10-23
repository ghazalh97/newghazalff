"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { storage, type Capsule, type Flashcard, type QuizQuestion } from "@/lib/storage"
import { FlashcardEditor } from "@/components/flashcard-editor"
import { QuizEditor } from "@/components/quiz-editor"

interface AuthorModeProps {
  capsuleId?: string
}

export function AuthorMode({ capsuleId }: AuthorModeProps) {
  const router = useRouter()
  const [capsule, setCapsule] = useState<Capsule>({
    id: capsuleId || crypto.randomUUID(),
    title: "",
    subject: "",
    level: "",
    description: "",
    notes: "",
    flashcards: [],
    quiz: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (capsuleId && capsuleId !== "new") {
      const loaded = storage.getCapsule(capsuleId)
      if (loaded) {
        setCapsule(loaded)
      }
    }
  }, [capsuleId])

  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleSave(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [capsule, hasChanges])

  const handleSave = (showMessage = true) => {
    if (!capsule.title.trim()) {
      if (showMessage) {
        alert("Please enter a title for your capsule")
      }
      return
    }

    if (!capsule.notes && capsule.flashcards.length === 0 && capsule.quiz.length === 0) {
      if (showMessage) {
        alert("Please add at least one type of content (notes, flashcards, or quiz)")
      }
      return
    }

    const updated = {
      ...capsule,
      updatedAt: Date.now(),
    }

    storage.saveCapsule(updated)
    setCapsule(updated)
    setHasChanges(false)

    if (showMessage) {
      alert("Capsule saved successfully!")
    }
  }

  const updateCapsule = (updates: Partial<Capsule>) => {
    setCapsule((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleAddFlashcard = () => {
    const newFlashcard: Flashcard = {
      id: crypto.randomUUID(),
      front: "",
      back: "",
    }
    updateCapsule({ flashcards: [...capsule.flashcards, newFlashcard] })
  }

  const handleUpdateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    updateCapsule({
      flashcards: capsule.flashcards.map((fc) => (fc.id === id ? { ...fc, ...updates } : fc)),
    })
  }

  const handleDeleteFlashcard = (id: string) => {
    updateCapsule({
      flashcards: capsule.flashcards.filter((fc) => fc.id !== id),
    })
  }

  const handleAddQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    }
    updateCapsule({ quiz: [...capsule.quiz, newQuestion] })
  }

  const handleUpdateQuizQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    updateCapsule({
      quiz: capsule.quiz.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    })
  }

  const handleDeleteQuizQuestion = (id: string) => {
    updateCapsule({
      quiz: capsule.quiz.filter((q) => q.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {capsuleId && capsuleId !== "new" ? "Edit" : "Create"} Capsule
            </h2>
            <p className="text-sm text-muted-foreground">{hasChanges ? "Auto-saving..." : "All changes saved"}</p>
          </div>
        </div>
        <Button onClick={() => handleSave(true)}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capsule Information</CardTitle>
          <CardDescription>Basic details about your learning capsule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to React Hooks"
              value={capsule.title}
              onChange={(e) => updateCapsule({ title: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Computer Science"
                value={capsule.subject}
                onChange={(e) => updateCapsule({ subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                placeholder="e.g., Beginner, Intermediate"
                value={capsule.level}
                onChange={(e) => updateCapsule({ level: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this capsule covers..."
              value={capsule.description}
              onChange={(e) => updateCapsule({ description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards ({capsule.flashcards.length})</TabsTrigger>
          <TabsTrigger value="quiz">Quiz ({capsule.quiz.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Write your study notes here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your notes here..."
                value={capsule.notes}
                onChange={(e) => updateCapsule({ notes: e.target.value })}
                rows={15}
                className="font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Flashcards</h3>
              <p className="text-sm text-muted-foreground">Create flashcards to test your knowledge</p>
            </div>
            <Button onClick={handleAddFlashcard}>
              <Plus className="mr-2 h-4 w-4" />
              Add Flashcard
            </Button>
          </div>

          {capsule.flashcards.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-muted-foreground">No flashcards yet</p>
                <Button onClick={handleAddFlashcard}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Flashcard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {capsule.flashcards.map((flashcard, index) => (
                <FlashcardEditor
                  key={flashcard.id}
                  flashcard={flashcard}
                  index={index}
                  onUpdate={(updates) => handleUpdateFlashcard(flashcard.id, updates)}
                  onDelete={() => handleDeleteFlashcard(flashcard.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Quiz Questions</h3>
              <p className="text-sm text-muted-foreground">Create multiple-choice questions</p>
            </div>
            <Button onClick={handleAddQuizQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {capsule.quiz.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-muted-foreground">No quiz questions yet</p>
                <Button onClick={handleAddQuizQuestion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {capsule.quiz.map((question, index) => (
                <QuizEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={(updates) => handleUpdateQuizQuestion(question.id, updates)}
                  onDelete={() => handleDeleteQuizQuestion(question.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
