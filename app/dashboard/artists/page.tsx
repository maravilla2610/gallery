"use client"

import { HoverEffect } from "@/components/card-hover-effect"
import { Button } from "@/components/ui/button"
import { IconPlus, IconUser } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CreateArtistForm from "@/components/create-artist-form"
import { useDeleteArtist } from "@/hooks/use-artists"
import { toast } from "sonner"
import { getArtists } from "@/app/actions/artists"
import { useEffect, useState } from "react"
import type { Artist } from "@/lib/schemas/artist.schema"
import { Skeleton } from "@/components/ui/skeleton"

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const deleteArtist = useDeleteArtist()

  useEffect(() => {
    setLoading(true)
    getArtists()
      .then(setArtists)
      .catch((error) => {
        console.error("Error fetching artists:", error)
        toast.error("Failed to load artists")
      })
      .finally(() => setLoading(false))
  }, [refreshKey])

  const handleDelete = async (artistId: string) => {
    const artist = artists.find(a => a.id === artistId)
    const artPiecesCount = artist?._count || 0
    
    if (artPiecesCount > 0) {
      toast.error(`Cannot delete artist with ${artPiecesCount} art piece(s). Please delete the art pieces first.`)
      return
    }

    if (!confirm('Are you sure you want to delete this artist?')) {
      return
    }

    try {
      await deleteArtist.mutateAsync(artistId)
      toast.success('Artist deleted successfully!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete artist')
    }
  }

  const handleArtistCreated = () => {
    setRefreshKey(prev => prev + 1)
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artists 🎨</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all artists in your gallery
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Create New Artist</DialogTitle>
              <DialogDescription>
                Add a new artist to your gallery collection.
              </DialogDescription>
            </DialogHeader>
            <CreateArtistForm onSuccess={handleArtistCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Artists Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-10">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-muted rounded-full p-6 mb-4">
            <IconUser className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No artists yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get started by adding your first artist to the gallery. Artists can have multiple art pieces associated with them.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <IconPlus className="mr-2 h-4 w-4" />
                Add Your First Artist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader>
                <DialogTitle>Create New Artist</DialogTitle>
                <DialogDescription>
                  Add a new artist to your gallery collection.
                </DialogDescription>
              </DialogHeader>
              <CreateArtistForm onSuccess={handleArtistCreated} />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <HoverEffect 
          items={artists.map((artist) => {
            const artPiecesCount = artist._count || 0
            return {
              id: artist.id,
              title: artist.name || 'Unnamed Artist',
              description: `${artPiecesCount} art piece${artPiecesCount !== 1 ? 's' : ''} • Created ${new Date(artist.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}`,
              link: `/dashboard/artists/${artist.id}`,
            }
          })}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
