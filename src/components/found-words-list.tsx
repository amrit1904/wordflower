"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export interface FoundWordsListProps {
  foundWords: string[]
  totalWords: number
  pangrams?: string[] // Optional array of pangram words
}

export function FoundWordsList({ foundWords, totalWords, pangrams = [] }: FoundWordsListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Found Words
        </h3>
        <div className="text-sm font-medium text-muted-foreground">
          {foundWords.length} / {totalWords}
        </div>
      </div>      
      {foundWords.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No words found yet. Start playing!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {[...foundWords]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
            .map((word, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-sm select-none ${
                pangrams.includes(word)
                  ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border border-yellow-500 shadow-md font-bold'
                  : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'
              }`}
            >
              {word.toUpperCase()}              
            </span>
          ))}
        </div>
      )}

      {foundWords.length === totalWords && (
        <div className="mt-4 p-4 bg-success/20 rounded-lg text-center">
          <p className="text-success font-bold text-lg">🎉 Congratulations!</p>
          <p className="text-success-foreground">You found all the words!</p>
        </div>
      )}
    </Card>
  )
}
