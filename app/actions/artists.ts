'use server'

import prisma from '@/prisma/client'
import { revalidatePath } from 'next/cache'
import {
  type Artist,
  type CreateArtistInput 
} from '@/lib/schemas/artist.schema'

export async function getArtists(): Promise<Artist[]> {
    try {
        const artists = await prisma.artist.findMany({
            orderBy: {
                created_at: 'desc',
            },
            include: {
                _count: {
                    select: {
                        art_pieces: true,
                    },
                },
            },
        })
        
        console.log('Fetched artists:', artists)
        
        // Parse and serialize each artist for client-safe transmission
        return artists.map(artist => ({
            ...artist,
            created_at: artist.created_at.toISOString(),
            _count: artist._count?.art_pieces,
        } as Artist))
    } catch (error) {
        console.error('Error fetching artists:', error)
        throw new Error('Failed to fetch artists')
    }
}


export async function createArtist(input: CreateArtistInput): Promise<Artist> {
    try {

        // Create the artist
        const artist = await prisma.artist.create({
            data: {
                name: input.name,
            },
        })

        console.log('Created artist:', artist)

        return {
            ...artist,
            created_at: artist.created_at.toISOString(),
            name: artist.name || '',
        }
    } catch (error) {
        console.error('Error creating artist:', error)
        throw error instanceof Error ? error : new Error('Failed to create artist')
    }
}

export async function deleteArtist(artistId: string): Promise<void> {
    try {
        // Check if artist has art pieces
        const artPiecesCount = await prisma.art_piece.count({
            where: {
                artist_id: artistId,
            },
        })

        if (artPiecesCount > 0) {
            throw new Error(`Cannot delete artist with ${artPiecesCount} art piece(s). Please delete the art pieces first.`)
        }

        // Delete the artist
        await prisma.artist.delete({
            where: {
                id: artistId,
            },
        })

        console.log('Deleted artist:', artistId)

        // Revalidate paths that display artists
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/artists')
    } catch (error) {
        console.error('Error deleting artist:', error)
        throw error instanceof Error ? error : new Error('Failed to delete artist')
    }
}
