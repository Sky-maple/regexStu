import type { Chapter, Exercise, Level, Lesson } from '@/types'
import { basicChapters } from './basics'
import { quantChapters } from './quant'
import { groupChapters } from './groups'
import { advancedChapters } from './advanced'
import { javaChapters } from './java'

export const chapters: Chapter[] = [
  ...basicChapters,
  ...quantChapters,
  ...groupChapters,
  ...advancedChapters,
  ...javaChapters
].sort((a, b) => a.no.localeCompare(b.no))

export interface LessonRef extends Lesson {
  chapterId: string
  chapterNo: string
  chapterTitle: string
  chapterStage: string
}

export const lessons: LessonRef[] = chapters.flatMap((c) =>
  c.lessons.map((l) => ({
    ...l,
    chapterId: c.id,
    chapterNo: c.no,
    chapterTitle: c.title,
    chapterStage: c.stage
  }))
)

export function getLesson(id?: string): LessonRef | undefined {
  if (!id) return undefined
  return lessons.find((l) => l.id === id)
}

export function getChapter(id?: string): Chapter | undefined {
  if (!id) return undefined
  return chapters.find((c) => c.id === id)
}

export function firstLessonOf(chapterId: string): LessonRef | undefined {
  const c = getChapter(chapterId)
  return c ? getLesson(c.lessons[0]?.id) : undefined
}

export function neighbors(id: string): { prev?: LessonRef; next?: LessonRef } {
  const i = lessons.findIndex((l) => l.id === id)
  return { prev: i > 0 ? lessons[i - 1] : undefined, next: i >= 0 && i < lessons.length - 1 ? lessons[i + 1] : undefined }
}

export interface ExerciseRef {
  exercise: Exercise
  lesson: LessonRef
}

export const allExercises: ExerciseRef[] = lessons.flatMap((lesson) =>
  lesson.exercises.map((exercise) => ({ exercise, lesson }))
)

export function exercisesByLevel(level: Level | 0): ExerciseRef[] {
  return level === 0 ? allExercises : allExercises.filter((e) => e.exercise.level === level)
}

export function getExercise(id: string): ExerciseRef | undefined {
  return allExercises.find((e) => e.exercise.id === id)
}

export const totalLessonCount = lessons.length
export const totalExerciseCount = allExercises.length

/** 每个难度有多少题，用于练习页筛选 */
export const levelCounts: Record<number, number> = [0, 1, 2, 3, 4, 5].reduce(
  (acc, lv) => {
    acc[lv] = lv === 0 ? allExercises.length : allExercises.filter((e) => e.exercise.level === lv).length
    return acc
  },
  {} as Record<number, number>
)
