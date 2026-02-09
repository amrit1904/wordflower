import { NextResponse } from "next/server"
import { fetchWordHints } from "@/lib/mw-api"
import wordData from '@/data/wordData.json'
import hintData from '@/data/hintData.json'

interface HintDataMap {
  [gameId: string]: any[]
}

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json()

    if (!gameId) return NextResponse.json({ error: "Missing gameId" }, { status: 400 })

    // First, check if we have pre-fetched hints for this game
    const hintDataTyped = hintData as HintDataMap
    const preloadedHints = hintDataTyped[String(gameId)]

    if (preloadedHints && preloadedHints.length > 0) {
      console.log(`Hint API: Using ${preloadedHints.length} pre-fetched hints for game ${gameId}`)
      return NextResponse.json(preloadedHints)
    }

    // Fallback: fetch 10 random hints from API
    console.log(`Hint API: No pre-fetched hints for game ${gameId}, fetching from API...`)

    const game = wordData.find(g => g.id === +gameId)
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 })

    const allWords = Array.from(game.words)
    const shuffled = allWords.sort(() => 0.5 - Math.random())
    const selectedWords = shuffled.slice(0, 10) // pick 10 words

    const hintPromises = selectedWords.map((w) => fetchWordHints(w))
    const hints = await Promise.all(hintPromises)
    const filteredHints = hints.filter((h) => h !== null)

    return NextResponse.json(filteredHints)
  } catch (err) {
    console.error("Failed to fetch hints:", err)
    return NextResponse.json({ error: "Failed to fetch hints" }, { status: 500 })
  }
}
