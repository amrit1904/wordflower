import type { WordHints } from "@/lib/word-data"

// Configurable inactivity threshold in seconds
export const ADAPTIVE_HINT_INACTIVITY_THRESHOLD = 15

// --- Strategy 2: Three-letter prefix counts ---

/**
 * Builds a map of 3-letter prefixes → list of words starting with that prefix.
 * Only includes prefixes where the word is at least 4 letters long.
 */
export function computeThreeLetterPrefixCounts(words: string[]): Map<string, string[]> {
    const prefixMap = new Map<string, string[]>()
    for (const word of words) {
        const upper = word.toUpperCase()
        if (upper.length < 4) continue
        const prefix = upper.slice(0, 3)
        const existing = prefixMap.get(prefix)
        if (existing) {
            existing.push(upper)
        } else {
            prefixMap.set(prefix, [upper])
        }
    }
    return prefixMap
}

// --- Strategy 3: Repeated letter words ---

export interface RepeatedLetterWord {
    word: string   // e.g. "MOOD"
    pattern: string // e.g. "_OO_"
}

/**
 * Finds all words that contain at least one repeated letter and generates
 * a blanked pattern that reveals only the repeated letters.
 * E.g., MOOD → _OO_, COFFEE → _O__EE
 */
export function computeRepeatedLetterWords(words: string[]): RepeatedLetterWord[] {
    const results: RepeatedLetterWord[] = []

    for (const word of words) {
        const upper = word.toUpperCase()
        if (upper.length < 4) continue

        // Count letter frequencies
        const freq: Record<string, number> = {}
        for (const ch of upper) {
            freq[ch] = (freq[ch] || 0) + 1
        }

        // Find letters that appear more than once
        const repeatedLetters = new Set(
            Object.entries(freq)
                .filter(([, count]) => count > 1)
                .map(([letter]) => letter)
        )

        if (repeatedLetters.size === 0) continue

        // Build blanked pattern: show repeated letters, blank the rest
        // Space out characters so individual letters are clearly visible
        const pattern = upper
            .split("")
            .map((ch) => (repeatedLetters.has(ch) ? ch : "_"))
            .join(" ")

        results.push({ word: upper, pattern })
    }

    return results
}

// --- Hint result type ---

export interface AdaptiveHintResult {
    strategy: 1 | 2 | 3
    message: string
    /** A short label for the hint type (for analytics) */
    strategyName: "definition" | "prefix_count" | "repeated_letters"
    /** The word this hint is about (if applicable) */
    targetWord?: string
}

// --- Main hint picker ---

/**
 * Picks an adaptive hint using one of the three strategies.
 * Cycles through strategies in order: 1 → 2 → 3 → 1 → ...
 * Falls back to the next strategy if the current one has no candidates.
 *
 * Returns null if no hint can be generated (e.g., all words found).
 */
export function pickAdaptiveHint(
    allWords: string[],
    foundWords: string[],
    hintData: WordHints[],
    prefixMap: Map<string, string[]>,
    repeatedLetterWords: RepeatedLetterWord[],
    lastStrategyUsed: number // 0-based: pass 0 initially
): AdaptiveHintResult | null {
    const foundSet = new Set(foundWords.map((w) => w.toUpperCase()))
    const unfoundWords = allWords.filter((w) => !foundSet.has(w.toUpperCase()))

    if (unfoundWords.length === 0) return null

    // Try strategies in round-robin order starting from the next one
    const strategies = [1, 2, 3] as const
    for (let i = 0; i < strategies.length; i++) {
        const strategyIndex = (lastStrategyUsed + i) % strategies.length
        const strategy = strategies[strategyIndex]

        const result = tryStrategy(strategy, unfoundWords, foundSet, hintData, prefixMap, repeatedLetterWords)
        if (result) return result
    }

    return null
}

function tryStrategy(
    strategy: 1 | 2 | 3,
    unfoundWords: string[],
    foundSet: Set<string>,
    hintData: WordHints[],
    prefixMap: Map<string, string[]>,
    repeatedLetterWords: RepeatedLetterWord[]
): AdaptiveHintResult | null {
    switch (strategy) {
        case 1:
            return tryDefinitionHint(unfoundWords, hintData)
        case 2:
            return tryPrefixCountHint(unfoundWords, foundSet, prefixMap)
        case 3:
            return tryRepeatedLetterHint(unfoundWords, repeatedLetterWords)
    }
}

// --- Strategy 1: Definition hint ---

function tryDefinitionHint(
    unfoundWords: string[],
    hintData: WordHints[]
): AdaptiveHintResult | null {
    const unfoundSet = new Set(unfoundWords.map((w) => w.toUpperCase()))

    // Find hint data entries for unfound words
    const candidates = hintData.filter((h) => unfoundSet.has(h.word.toUpperCase()) && h.relatedWord)

    if (candidates.length === 0) return null

    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    const firstLetter = pick.word[0].toUpperCase()
    const wordLength = pick.word.length

    return {
        strategy: 1,
        strategyName: "definition",
        targetWord: pick.word,
        message: `Try a word that begins with "${firstLetter}", means "${pick.relatedWord}", and is ${wordLength} letters long.`,
    }
}

// --- Strategy 2: Prefix count hint ---

function tryPrefixCountHint(
    unfoundWords: string[],
    foundSet: Set<string>,
    prefixMap: Map<string, string[]>
): AdaptiveHintResult | null {
    // For each prefix, count how many words are still unfound
    let bestPrefix: string | null = null
    let bestCount = 0

    for (const [prefix, words] of prefixMap) {
        const remaining = words.filter((w) => !foundSet.has(w.toUpperCase()))
        // Only consider prefixes with >= 2 remaining words
        if (remaining.length >= 2 && remaining.length > bestCount) {
            bestPrefix = prefix
            bestCount = remaining.length
        }
    }

    if (!bestPrefix) return null

    return {
        strategy: 2,
        strategyName: "prefix_count",
        message: `There are ${bestCount} words remaining that start with "${bestPrefix}".`,
    }
}

// --- Strategy 3: Repeated letter blanks hint ---

function tryRepeatedLetterHint(
    unfoundWords: string[],
    repeatedLetterWords: RepeatedLetterWord[]
): AdaptiveHintResult | null {
    const unfoundSet = new Set(unfoundWords.map((w) => w.toUpperCase()))

    const candidates = repeatedLetterWords.filter((r) => unfoundSet.has(r.word))

    if (candidates.length === 0) return null

    const pick = candidates[Math.floor(Math.random() * candidates.length)]

    return {
        strategy: 3,
        strategyName: "repeated_letters",
        targetWord: pick.word,
        message: `This word has repeated letters: ${pick.pattern}. Remember, you can reuse letters!`,
    }
}
