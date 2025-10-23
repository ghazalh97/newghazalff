export interface Flashcard {
  id: string
  front: string
  back: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: [string, string, string, string]
  correctAnswer: number
}

export interface Capsule {
  id: string
  title: string
  subject: string
  level: string
  description: string
  notes: string
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  createdAt: number
  updatedAt: number
}

export interface CapsuleProgress {
  knownFlashcards: string[]
  bestQuizScore: number
}

const SCHEMA_VERSION = "pocket-classroom/v1"

export const storage = {
  getCapsules(): Capsule[] {
    if (typeof window === "undefined") return []
    const index = localStorage.getItem("pc_capsules_index")
    if (!index) return []

    const ids = JSON.parse(index) as string[]
    return ids
      .map((id) => {
        const data = localStorage.getItem(`pc_capsule_${id}`)
        return data ? JSON.parse(data) : null
      })
      .filter(Boolean)
  },

  getCapsule(id: string): Capsule | null {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(`pc_capsule_${id}`)
    return data ? JSON.parse(data) : null
  },

  saveCapsule(capsule: Capsule): void {
    if (typeof window === "undefined") return

    const index = localStorage.getItem("pc_capsules_index")
    const ids = index ? JSON.parse(index) : []

    if (!ids.includes(capsule.id)) {
      ids.push(capsule.id)
      localStorage.setItem("pc_capsules_index", JSON.stringify(ids))
    }

    localStorage.setItem(`pc_capsule_${capsule.id}`, JSON.stringify(capsule))
  },

  deleteCapsule(id: string): void {
    if (typeof window === "undefined") return

    const index = localStorage.getItem("pc_capsules_index")
    if (index) {
      const ids = JSON.parse(index).filter((cid: string) => cid !== id)
      localStorage.setItem("pc_capsules_index", JSON.stringify(ids))
    }

    localStorage.removeItem(`pc_capsule_${id}`)
    localStorage.removeItem(`pc_progress_${id}`)
  },

  getProgress(capsuleId: string): CapsuleProgress {
    if (typeof window === "undefined") return { knownFlashcards: [], bestQuizScore: 0 }
    const data = localStorage.getItem(`pc_progress_${capsuleId}`)
    return data ? JSON.parse(data) : { knownFlashcards: [], bestQuizScore: 0 }
  },

  saveProgress(capsuleId: string, progress: CapsuleProgress): void {
    if (typeof window === "undefined") return
    localStorage.setItem(`pc_progress_${capsuleId}`, JSON.stringify(progress))
  },

  exportCapsule(capsule: Capsule): string {
    return JSON.stringify(
      {
        schema: SCHEMA_VERSION,
        ...capsule,
      },
      null,
      2,
    )
  },

  importCapsule(jsonString: string): Capsule | null {
    try {
      const data = JSON.parse(jsonString)
      if (data.schema !== SCHEMA_VERSION) {
        throw new Error("Invalid schema version")
      }

      const { schema, ...capsule } = data

      // Validate required fields
      if (!capsule.id || !capsule.title) {
        throw new Error("Missing required fields")
      }

      return capsule as Capsule
    } catch (error) {
      console.error("Import failed:", error)
      return null
    }
  },
}
