import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'


// Results interface

interface GameResults {
    foundWords: string[],
    allWords?: string[],
    timer: number,
    gameData: any,
    timestamp: Date
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, gameId, results } = body

        if (!userId || !gameId || !results) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, gameId and results' },
                { status: 400 }
            )
        }

        const collection = await getCollection('wordflower_collection')

        // Find the user and update the specific game session's results
        const result = await collection.updateOne(
            {
                userId,
                'gameSessions.gameId': gameId
            },
            {
                $set: {
                    'gameSessions.$.results': results,
                    'gameSessions.$.updatedAt': new Date(),
                    updatedAt: new Date()
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'User or game session not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Game results logging error:', error)
        return NextResponse.json(
            { error: 'Failed to log game results' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const gameId = searchParams.get('gameId')

    if (!userId || !gameId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and gameId' },
        { status: 400 }
      )
    }

    const collection = await getCollection('wordflower_collection')
    const userAnalytics = await collection.findOne({ userId })

    if (!userAnalytics) {
      return NextResponse.json(
        { error: 'User analytics not found' },
        { status: 404 }
      )
    }

    // Find the specific game session
    const gameSession = userAnalytics.gameSessions?.find(
      (session: any) => session.gameId === gameId
    )

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      )
    }

    if (!gameSession.results) {
      return NextResponse.json(
        { error: 'No results found for this game session' },
        { status: 404 }
      )
    }

    return NextResponse.json(gameSession.results || {})
  } catch (error) {
    console.error('Game results retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve game results' },
      { status: 500 }
    )
  }
}