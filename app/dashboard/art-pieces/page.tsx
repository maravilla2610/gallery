"use client"

import { useState, useEffect } from "react"
import { FocusCards } from "@/components/focus-cards"
import { Button } from "@/components/ui/button"
import { IconPlus, IconPalette } from "@tabler/icons-react"
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
} from "@/components/ui/animated-modal"
import CreateArtPieceForm from "@/components/create-art-piece-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useArtists } from "@/hooks/use-artists"
import { getArtPiecesByArtist } from "@/app/actions/art-pieces"
import { Skeleton } from "@/components/ui/skeleton"
import type { ArtPiece } from "@/lib/schemas/art-piece.schema"

export default function ArtPiecesPage() {
  const { data: artists, isLoading: artistsLoading } = useArtists()
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([])
  const [loadingArtPieces, setLoadingArtPieces] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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

  const selectedArtist = artists?.find((a) => a.id === selectedArtistId)

  // Transform art pieces to focus cards format
  const focusCardsData = artPieces.map((piece) => ({
    title: piece.name,
    src: piece.image || "/placeholder.png", // Display the uploaded image
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
            <SelectContent>
              {artists?.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name || "Unnamed Artist"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Art Piece Button */}
          <Modal>
            <ModalTrigger>
              <Button disabled={!selectedArtistId}>
                <IconPlus className="mr-2 h-4 w-4" />
                Add Art Piece
              </Button>
            </ModalTrigger>
            <ModalBody>
              <ModalContent className="overflow-y-auto">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
                  Create New Art Piece
                </h2>
                {artists && (
                  <CreateArtPieceForm 
                    artists={artists}
                    onSuccess={handleArtPieceCreated}
                  />
                )}
              </ModalContent>
            </ModalBody>
          </Modal>
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
          <Modal>
            <ModalTrigger>
              <Button size="lg">
                <IconPlus className="mr-2 h-4 w-4" />
                Add First Art Piece
              </Button>
            </ModalTrigger>
            <ModalBody>
              <ModalContent className="overflow-y-auto">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
                  Create New Art Piece
                </h2>
                {artists && (
                  <CreateArtPieceForm 
                    artists={artists}
                    onSuccess={handleArtPieceCreated}
                  />
                )}
              </ModalContent>
            </ModalBody>
          </Modal>
        </div>
      ) : (
        <div className="py-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {selectedArtist?.name}'s Collection
          </h2>
          <FocusCards cards={focusCardsData} />
        </div>
      )}
    </div>
  )
}
