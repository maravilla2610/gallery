'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useModal } from '@/components/ui/animated-modal'
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
import { useCreateArtist } from '@/hooks/use-artists'
import { createArtistSchema } from '@/lib/schemas/artist.schema'

interface CreateArtistFormProps {
  onSuccess?: () => void
}

export default function CreateArtistForm({ onSuccess }: CreateArtistFormProps) {
  const { setOpen } = useModal()
  const createArtist = useCreateArtist()

  // Define the form using the Zod schema
  const form = useForm<z.infer<typeof createArtistSchema>>({
    resolver: zodResolver(createArtistSchema),
    defaultValues: {
      name: '',
    },
  })

  // Define submit handler
  async function onSubmit(values: z.infer<typeof createArtistSchema>) {
    try {
      await createArtist.mutateAsync(values)

      // Reset form
      form.reset()
      
      // Close modal
      setOpen(false)
      
      // Show success message
      toast.success('Artist created successfully!')
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.log(err)
      toast.error(err instanceof Error ? err.message : 'An error occurred')
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
              <FormLabel>Artist Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter artist name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the artist (2-255 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createArtist.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createArtist.isPending}>
            {createArtist.isPending ? 'Creating...' : 'Create Artist'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
