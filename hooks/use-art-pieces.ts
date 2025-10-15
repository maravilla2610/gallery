import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getArtPiecesByArtist, createArtPiece } from '@/app/actions/art-pieces'
import type { CreateArtPieceInput } from '@/lib/schemas/art-piece.schema'

// Hook to fetch art pieces by artist
export function useArtPiecesByArtist(artistId: string) {
  return useQuery({
    queryKey: ['art-pieces', artistId],
    queryFn: () => getArtPiecesByArtist(artistId),
    enabled: !!artistId,
  })
}

// Hook to create art piece
export function useCreateArtPiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateArtPieceInput) => createArtPiece(input),
    onSuccess: (data, variables) => {
      // Invalidate and refetch art pieces query for this artist
      queryClient.invalidateQueries({ queryKey: ['art-pieces', variables.artist_id] })
      queryClient.invalidateQueries({ queryKey: ['art-pieces'] })
    },
  })
}
