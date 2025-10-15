import { z } from 'zod'

export const schema = z.object({
  id: z.string(),
  created_at: z.date(),
  amount: z.number().nullable(),
  blumon_id: z.string().nullable(),
  art_piece_id: z.string(),
})

export type Transaction = z.infer<typeof schema>