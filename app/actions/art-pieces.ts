'use server'

import prisma from '@/prisma/client'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { 
  type ArtPiece,
  type CreateArtPieceInput,
  createArtPieceSchema 
} from '@/lib/schemas/art-piece.schema'

export async function getArtPiecesByArtist(artistId: string): Promise<ArtPiece[]> {
  try {
    const artPieces = await prisma.art_piece.findMany({
      where: {
        artist_id: artistId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    
    // Parse and serialize each art piece for client-safe transmission
    return artPieces.map(piece => ({
      ...piece,
      created_at: piece.created_at.toISOString(),
      // Parse the prisma decimal to a number or null
      price: piece.price ? parseFloat(piece.price.toString()) : null,
      qr_code: piece.qr_code || null,
      image: piece.image || undefined,
    })) as ArtPiece[]
  } catch (error) {
    console.error('Error fetching art pieces:', error)
    throw new Error('Failed to fetch art pieces')
  }
}

export async function createArtPiece(input: CreateArtPieceInput): Promise<ArtPiece> {
  try {
    // Validate the input
    const validatedInput = createArtPieceSchema.parse(input)
    
    // Create the art piece
    const artPiece = await prisma.art_piece.create({
      data: {
        name: validatedInput.name,
        description: validatedInput.description || null,
        price: validatedInput.price || null,
        qr_code: null,
        artist_id: validatedInput.artist_id,
        image: validatedInput.image || null,
      },
    })


    // Serialize for client-safe return
    return {
      id: artPiece.id,
      created_at: artPiece.created_at.toISOString(),
      name: artPiece.name,
      description: artPiece.description,
      price: artPiece.price ? parseFloat(artPiece.price.toString()) : null,
      qr_code: artPiece.qr_code || null,
      artist_id: artPiece.artist_id,
      image: artPiece.image || undefined,
    } as ArtPiece
  } catch (error) {
    console.error('Error creating art piece:', error)
    throw error instanceof Error ? error : new Error('Failed to create art piece')
  }
}
