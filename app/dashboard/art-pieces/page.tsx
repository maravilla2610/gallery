"use client"

import { useState, useEffect } from "react"
import { FocusCards } from "@/components/focus-cards"
import { Button } from "@/components/ui/button"
import { IconPlus, IconPalette } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CreateArtPieceForm from "@/components/create-art-piece-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useArtists } from "@/hooks/use-artists"
import { getArtPiecesByArtist, deleteArtPiece, generateArtPieceDocument } from "@/app/actions/art-pieces"
import { Skeleton } from "@/components/ui/skeleton"
import type { ArtPiece } from "@/lib/schemas/art-piece.schema"
import { toast } from 'sonner'

export default function ArtPiecesPage() {
  const { data: artists, isLoading: artistsLoading } = useArtists()
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([])
  const [loadingArtPieces, setLoadingArtPieces] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Set the first artist as selected by default when artists are loaded
  useEffect(() => {
    if (artists && artists.length > 0 && !selectedArtistId) {
      setSelectedArtistId(artists[0].id)
    }
  }, [artists, selectedArtistId])

  // Fetch art pieces when an artist is selected
  useEffect(() => {
    if (selectedArtistId) {
      setLoadingArtPieces(true)
      getArtPiecesByArtist(selectedArtistId)
        .then((pieces) => {
          setArtPieces(pieces)
        })
        .catch((error) => {
          console.error("Error fetching art pieces:", error)
          setArtPieces([])
        })
        .finally(() => {
          setLoadingArtPieces(false)
        })
    }
  }, [selectedArtistId, refreshKey])

  const handleArtPieceCreated = () => {
    // Refresh the art pieces list
    setRefreshKey((prev) => prev + 1)
  }

  const handleDelete = async (artPieceId: string) => {
    if (!confirm("Are you sure you want to delete this art piece? This action cannot be undone.")) {
      return
    }

    try {
      await deleteArtPiece(artPieceId)
      toast.success("Art piece deleted successfully")
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Error deleting art piece:", error)
      toast.error("Failed to delete art piece. Please try again.")
    }
  }

  const handleDownload = async (artPieceId: string) => {
    try {
      const html = await generateArtPieceDocument(artPieceId)
      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const artPiece = artPieces.find((p) => p.id === artPieceId)
      a.download = `${artPiece?.name || "art-piece"}-certificate.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Document downloaded successfully")
    } catch (error) {
      console.error("Error downloading document:", error)
      toast.error("Failed to download document. Please try again.") 
    }
  }

  const selectedArtist = artists?.find((a) => a.id === selectedArtistId)

  // Transform art pieces to focus cards format
  const focusCardsData = artPieces.map((piece) => ({
    title: piece.name,
    src: piece.image || "/placeholder.png", // Display the uploaded image
    id: piece.id,
    onDelete: handleDelete,
    onDownload: handleDownload,
  }))

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Art Pieces 🖼️</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage art pieces by artist
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Artist Selector */}
          <Select
            value={selectedArtistId || undefined}
            onValueChange={setSelectedArtistId}
            disabled={artistsLoading || !artists || artists.length === 0}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select an artist" />
            </SelectTrigger>
            <SelectContent position="item-aligned" sideOffset={5}>
              {artists?.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name || "Unnamed Artist"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Art Piece Button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedArtistId}>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Art Piece
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader>
                <DialogTitle>Create New Art Piece</DialogTitle>
                <DialogDescription>
                  Add a new art piece to your gallery collection.
                </DialogDescription>
              </DialogHeader>
              {artists && (
                <CreateArtPieceForm 
                  artists={artists}
                  onSuccess={handleArtPieceCreated}
                  onOpenChange={setDialogOpen}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {artistsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
            <Skeleton className="h-60 md:h-96 w-full rounded-lg" />
            <Skeleton className="h-60 md:h-96 w-full rounded-lg" />
            <Skeleton className="h-60 md:h-96 w-full rounded-lg" />
          </div>
        </div>
      ) : !artists || artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-muted rounded-full p-6 mb-4">
            <IconPalette className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No artists yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Please add artists first before creating art pieces. Artists are required to categorize art pieces.
          </p>
          <Button size="lg" onClick={() => (window.location.href = "/dashboard/artists")}>
            Go to Artists Page
          </Button>
        </div>
      ) : loadingArtPieces ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
          <Skeleton className="h-60 md:h-96 w-full rounded-lg" />
          <Skeleton className="h-60 md:h-96 w-full rounded-lg" />
          <Skeleton className="h-60 md:h-96 w-full rounded-lg" />
        </div>
      ) : artPieces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-muted rounded-full p-6 mb-4">
            <IconPalette className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            No art pieces for {selectedArtist?.name || "this artist"}
          </h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get started by adding the first art piece for this artist. You can add descriptions, pricing, and more.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <IconPlus className="mr-2 h-4 w-4" />
                Add First Art Piece
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <DialogHeader>
                <DialogTitle>Create New Art Piece</DialogTitle>
                <DialogDescription>
                  Add a new art piece to your gallery collection.
                </DialogDescription>
              </DialogHeader>
              {artists && (
                <CreateArtPieceForm 
                  artists={artists}
                  onSuccess={handleArtPieceCreated}
                  onOpenChange={setDialogOpen}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="py-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {selectedArtist?.name}&apos;s Collection
          </h2>
          <FocusCards cards={focusCardsData} />
        </div>
      )}
    </div>
  )
}
