'use client'

import { IconCirclePlusFilled } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CreateArtPieceForm from "@/components/create-art-piece-form"
import { Artist } from "@/lib/schemas/artist.schema"
import { useState } from "react"

export function QuickCreateModal({
  artists,
  isLoading
}: {
  artists: Artist[]
  isLoading?: boolean
}) {
  const [open, setOpen] = useState(false)
  
  console.log("Artists in QuickCreateModal:", artists)
  
  return (
    <div className="flex items-center gap-2 w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground w-full justify-start gap-2"
            disabled={isLoading}
          >
            <IconCirclePlusFilled />
            <span>{isLoading ? 'Loading...' : 'Quick Create'}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Create New Art Piece</DialogTitle>
            <DialogDescription>
              Add a new art piece to your gallery collection.
            </DialogDescription>
          </DialogHeader>
          <CreateArtPieceForm artists={artists} onOpenChange={setOpen} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
