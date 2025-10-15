import { Prisma } from '@prisma/client'
import { artist } from '@prisma/client'

import { z } from 'zod'

// Schema for serialized art piece (for client components)
export const artPieceSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  price: z.number().min(0.01).max(999999.99).nullable(),
  qr_code: z.string().nullable(),
  artist_id: z.string().uuid(),
  image: z.string().nullable().optional(),
})

// Schema for creating an art piece (doesn't need id, created_at, or qr_code)
export const createArtPieceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().max(1000).nullable().optional(),
  price: z.number().min(0.01).max(999999.99).nullable().optional(),
  artist_id: z.string().uuid("Please select an artist"),
  image: z.string().nullable().optional(),
})

// Schema for updating an art piece
export const updateArtPieceSchema = artPieceSchema.partial()

// Type exports
export type ArtPiece = z.infer<typeof artPieceSchema>
export type CreateArtPieceInput = z.infer<typeof createArtPieceSchema>
export type UpdateArtPieceInput = z.infer<typeof updateArtPieceSchema>


