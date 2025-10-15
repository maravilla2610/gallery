import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getArtists, createArtist, deleteArtist } from '@/app/actions/artists'
import type { CreateArtistInput } from '@/lib/schemas/artist.schema'

// Hook to fetch artists
export function useArtists() {
  return useQuery({
    queryKey: ['artists'],
    queryFn: getArtists,
  })
}

// Hook to create artist
export function useCreateArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateArtistInput) => createArtist(input),
    onSuccess: () => {
      // Invalidate and refetch artists query
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}

// Hook to delete artist
export function useDeleteArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (artistId: string) => deleteArtist(artistId),
    onSuccess: () => {
      // Invalidate and refetch artists query
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}
