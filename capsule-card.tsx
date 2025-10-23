"use client"

import { useState } from "react"
import { BookOpen, Edit, Download, Trash2, GraduationCap, Clock, Trophy, Brain } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { storage, type Capsule } from "@/lib/storage"
import { useRouter } from "next/navigation"

interface CapsuleCardProps {
  capsule: Capsule
  onDelete: (id: string) => void
  onUpdate: () => void
}

export function CapsuleCard({ capsule, onDelete, onUpdate }: CapsuleCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const progress = storage.getProgress(capsule.id)

  const handleExport = () => {
    const json = storage.exportCapsule(capsule)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${capsule.title.replace(/\s+/g, "-").toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const knownCount = progress.knownFlashcards.length
  const totalFlashcards = capsule.flashcards.length

  return (
    <>
      <Card className="flex flex-col transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="line-clamp-1">{capsule.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">{capsule.description || "No description"}</CardDescription>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{capsule.subject}</Badge>
            <Badge variant="outline">{capsule.level}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDate(capsule.updatedAt)}</span>
          </div>

          <div className="space-y-2">
            {capsule.flashcards.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Flashcards</span>
                </div>
                <span className="font-medium">
                  {knownCount}/{totalFlashcards} known
                </span>
              </div>
            )}

            {capsule.quiz.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent" />
                  <span>Best Score</span>
                </div>
                <span className="font-medium">
                  {progress.bestQuizScore}/{capsule.quiz.length}
                </span>
              </div>
            )}

            {capsule.notes && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Notes available</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button className="flex-1" onClick={() => router.push(`/learn/${capsule.id}`)}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Learn
          </Button>
          <Button variant="outline" size="icon" onClick={() => router.push(`/author/${capsule.id}`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Capsule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{capsule.title}" and all its progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(capsule.id)
                setShowDeleteDialog(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
