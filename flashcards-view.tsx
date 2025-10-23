"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { storage, type Flashcard } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface FlashcardsViewProps {
  capsuleId: string
  flashcards: Flashcard[]
}

export function FlashcardsView({ capsuleId, flashcards }: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(storage.getProgress(capsuleId))

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault()
        setIsFlipped((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const currentCard = flashcards[currentIndex]
  const knownCount = progress.knownFlashcards.length
  const progressPercent = (knownCount / flashcards.length) * 100

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const handleMarkKnown = (known: boolean) => {
    const newKnownCards = known
      ? [...new Set([...progress.knownFlashcards, currentCard.id])]
      : progress.knownFlashcards.filter((id) => id !== currentCard.id)

    const newProgress = {
      ...progress,
      knownFlashcards: newKnownCards,
    }

    storage.saveProgress(capsuleId, newProgress)
    setProgress(newProgress)
    handleNext()
  }

  const handleReset = () => {
    const newProgress = {
      ...progress,
      knownFlashcards: [],
    }
    storage.saveProgress(capsuleId, newProgress)
    setProgress(newProgress)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const isKnown = progress.knownFlashcards.includes(currentCard.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
          <p className="text-sm font-medium">
            {knownCount} / {flashcards.length} known
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Progress
        </Button>
      </div>

      <Progress value={progressPercent} className="h-2" />

      <div className="perspective-1000">
        <Card
          className={cn(
            "relative min-h-[400px] cursor-pointer transition-all duration-500 hover:shadow-lg",
            isKnown && "border-primary",
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="flex min-h-[400px] items-center justify-center p-12">
            <div className="text-center">
              <p className="mb-4 text-sm font-medium text-muted-foreground">{isFlipped ? "Back" : "Front"}</p>
              <p className="text-2xl leading-relaxed">{isFlipped ? currentCard.back : currentCard.front}</p>
              <p className="mt-8 text-sm text-muted-foreground">Click or press Space to flip</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handlePrevious} disabled={flashcards.length <= 1}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleMarkKnown(false)} className="gap-2">
            <X className="h-4 w-4" />
            Unknown
          </Button>
          <Button onClick={() => handleMarkKnown(true)} className="gap-2">
            <Check className="h-4 w-4" />
            Known
          </Button>
        </div>

        <Button variant="outline" onClick={handleNext} disabled={flashcards.length <= 1}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
