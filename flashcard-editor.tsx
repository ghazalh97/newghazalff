"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Flashcard } from "@/lib/storage"

interface FlashcardEditorProps {
  flashcard: Flashcard
  index: number
  onUpdate: (updates: Partial<Flashcard>) => void
  onDelete: () => void
}

export function FlashcardEditor({ flashcard, index, onUpdate, onDelete }: FlashcardEditorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Flashcard {index + 1}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`front-${flashcard.id}`}>Front (Question)</Label>
          <Textarea
            id={`front-${flashcard.id}`}
            placeholder="What appears on the front of the card..."
            value={flashcard.front}
            onChange={(e) => onUpdate({ front: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`back-${flashcard.id}`}>Back (Answer)</Label>
          <Textarea
            id={`back-${flashcard.id}`}
            placeholder="What appears on the back of the card..."
            value={flashcard.back}
            onChange={(e) => onUpdate({ back: e.target.value })}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}
