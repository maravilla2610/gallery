'use client'

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
} from "@/components/ui/animated-modal"
import CreateArtPieceForm from "@/components/create-art-piece-form"
import { artist } from "@prisma/client"

export function QuickCreateModal({ 
  artists, 
  isLoading 
}: { 
  artists: artist[]
  isLoading?: boolean 
}) {
  console.log("Artists in QuickCreateModal:", artists)
  return (
    <div className="flex items-center gap-2 w-full">
      <Modal>
        <ModalTrigger className="flex-1">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground w-full justify-start gap-2"
            disabled={isLoading}
          >
            <IconCirclePlusFilled />
            <span>{isLoading ? 'Loading...' : 'Quick Create'}</span>
          </Button>
        </ModalTrigger>
        <ModalBody>
          <ModalContent className="overflow-y-auto">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
              Create New Art Piece
            </h2>
            <CreateArtPieceForm artists={artists} />
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  )
}
