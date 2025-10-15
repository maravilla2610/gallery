'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useModal } from '@/components/ui/animated-modal'
import React, { useState } from 'react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateArtPiece } from '@/hooks/use-art-pieces'
import { createArtPieceSchema } from '@/lib/schemas/art-piece.schema'
import type { Artist } from '@/lib/schemas/artist.schema'
import { createClient } from '@/lib/utils/supabase/client'

interface CreateArtPieceFormProps {
  onSuccess?: () => void
  artists: Artist[]
}

export default function CreateArtPieceForm({ onSuccess, artists }: CreateArtPieceFormProps) {
  const { setOpen } = useModal()
  const createArtPiece = useCreateArtPiece()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const supabase = createClient()

  // Define the form using the Zod schema
  const form = useForm<z.infer<typeof createArtPieceSchema>>({
    resolver: zodResolver(createArtPieceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      artist_id: '',
      image: undefined,
    },
  })

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (6MB limit for standard upload)
      if (file.size > 6 * 1024 * 1024) {
        toast.error('File size must be less than 6MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed')
        return
      }

      setSelectedFile(file)
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    const { error } = await supabase.storage
      .from('art_pieces')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket "art_pieces" not found. Please create it in Supabase Storage settings.')
      }
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('art_pieces')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Define submit handler
  async function onSubmit(values: z.infer<typeof createArtPieceSchema>) {
    try {
      console.log('Submitting art piece:', values)
      setIsUploading(true)

      // Upload image first if selected
      let imageUrl: string | undefined = undefined
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }

      // Then create the art piece with image URL
      await createArtPiece.mutateAsync({
        ...values,
        image: imageUrl,
      })

      // Reset form
      form.reset()
      setSelectedFile(null)

      // Close modal
      setOpen(false)

      // Show success message
      toast.success('Art piece created successfully!')

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Art Piece Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter art piece name" {...field} />
              </FormControl>
              <FormDescription>
                The name of your art piece (2-255 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  placeholder="Enter description"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Optional description of the art piece.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  {...field}
                  value={field.value ? Number(field.value) : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === '' ? null : parseFloat(value))
                  }}
                />
              </FormControl>
              <FormDescription>
                Optional price for the art piece.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="artist_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist</FormLabel>
              <Select
                onValueChange={(value) => {
                  try {
                    field.onChange(value)
                  } catch (error) {
                    console.error('Error changing artist:', error)
                  }
                }}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger onClick={() => {
                    console.log('Select trigger clicked')
                  }}>
                    <SelectValue placeholder="Select an artist" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" sideOffset={5}>
                  {artists.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No artists available. Please create an artist first.
                    </div>
                  ) : (
                    artists.map((artist) => (
                      <SelectItem
                        key={artist.id}
                        value={artist.id}
                      >
                        {artist.name || `Artist #${artist.id}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the artist who created this piece.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Image</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading || createArtPiece.isPending}
            />
          </FormControl>
          <FormDescription>
            Upload an image of the art piece (max 6MB).
            {selectedFile && (
              <span className="block mt-1 text-sm text-green-600">
                Selected: {selectedFile.name}
              </span>
            )}
          </FormDescription>
          <FormMessage />
        </FormItem>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createArtPiece.isPending || isUploading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createArtPiece.isPending || isUploading}>
            {isUploading ? 'Uploading...' : createArtPiece.isPending ? 'Creating...' : 'Create Art Piece'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
