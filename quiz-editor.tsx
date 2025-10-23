"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { QuizQuestion } from "@/lib/storage"

interface QuizEditorProps {
  question: QuizQuestion
  index: number
  onUpdate: (updates: Partial<QuizQuestion>) => void
  onDelete: () => void
}

export function QuizEditor({ question, index, onUpdate, onDelete }: QuizEditorProps) {
  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options] as [string, string, string, string]
    newOptions[optionIndex] = value
    onUpdate({ options: newOptions })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Question {index + 1}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Question</Label>
          <Textarea
            id={`question-${question.id}`}
            placeholder="Enter your question..."
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-3">
          <Label>Answer Options</Label>
          <RadioGroup
            value={question.correctAnswer.toString()}
            onValueChange={(value) => onUpdate({ correctAnswer: Number.parseInt(value) })}
          >
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-3">
                <RadioGroupItem value={optionIndex.toString()} id={`option-${question.id}-${optionIndex}`} />
                <Label htmlFor={`option-${question.id}-${optionIndex}`} className="sr-only">
                  Option {String.fromCharCode(65 + optionIndex)}
                </Label>
                <Input
                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground">Select the correct answer by clicking the radio button</p>
        </div>
      </CardContent>
    </Card>
  )
}
