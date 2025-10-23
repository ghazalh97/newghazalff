"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { storage, type QuizQuestion } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface QuizViewProps {
  capsuleId: string
  questions: QuizQuestion[]
}

export function QuizView({ capsuleId, questions }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const progress = storage.getProgress(capsuleId)

  const currentQuestion = questions[currentIndex]
  const progressPercent = ((currentIndex + 1) / questions.length) * 100

  const handleSubmit = () => {
    if (selectedAnswer === null) return

    setShowFeedback(true)

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setCompleted(true)

      const newScore = selectedAnswer === currentQuestion.correctAnswer ? score + 1 : score

      if (newScore > progress.bestQuizScore) {
        storage.saveProgress(capsuleId, {
          ...progress,
          bestQuizScore: newScore,
        })
      }
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setCompleted(false)
  }

  if (completed) {
    const finalScore = score
    const percentage = Math.round((finalScore / questions.length) * 100)
    const isPerfect = finalScore === questions.length
    const isGood = percentage >= 70

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            {isPerfect ? "Perfect score! Outstanding work!" : isGood ? "Great job!" : "Keep practicing!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-5xl font-bold">
              {finalScore}/{questions.length}
            </p>
            <p className="mt-2 text-muted-foreground">{percentage}% correct</p>
          </div>

          {progress.bestQuizScore > 0 && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-2xl font-bold">
                {progress.bestQuizScore}/{questions.length}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleReset} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-medium">
            Score: {score}/{currentIndex + (showFeedback ? 1 : 0)}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => {
              if (!showFeedback) {
                setSelectedAnswer(Number.parseInt(value))
              }
            }}
            disabled={showFeedback}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showCorrect = showFeedback && isCorrect
                const showIncorrect = showFeedback && isSelected && !isCorrect

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                      showCorrect && "border-primary bg-primary/5",
                      showIncorrect && "border-destructive bg-destructive/5",
                      !showFeedback && isSelected && "border-primary",
                    )}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showFeedback} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex flex-1 cursor-pointer items-center justify-between"
                    >
                      <span className="flex-1">{option}</span>
                      {showCorrect && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      {showIncorrect && <XCircle className="h-5 w-5 text-destructive" />}
                    </Label>
                  </div>
                )
              })}
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          {!showFeedback ? (
            <Button onClick={handleSubmit} disabled={selectedAnswer === null} className="w-full">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full">
              {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
