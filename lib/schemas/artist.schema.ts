import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Schema for serialized artist (for client components)
export const artistSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  name: z.string().min(1).max(255),
  _count: z.number().optional(),
}) satisfies z.Schema<Prisma.artistUncheckedCreateInput>



// Schema for creating an artist
export const createArtistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must not exceed 255 characters'),
})

// Schema for updating an artist
export const updateArtistSchema = createArtistSchema.partial()

// Type exports
export type Artist = z.infer<typeof artistSchema>
export type CreateArtistInput = z.infer<typeof createArtistSchema>
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>

