# Architecture: Server Actions + TanStack Query

## Why Not Prisma Client Directly in Hooks?

**You cannot use Prisma Client directly in React hooks** because:

1. ❌ **Client-side limitation**: React hooks run in the browser, but Prisma needs a database connection (server-side only)
2. ❌ **Security risk**: Would expose database credentials to the browser
3. ❌ **Architecture violation**: Database operations must happen on the server in Next.js

## Solution: Server Actions with TanStack Query

We use **Next.js Server Actions** which allow you to call server-side functions (with direct Prisma access) from client components, combined with TanStack Query for state management.

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Client Component (Browser)                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  useArtists() hook                                     │ │
│  │  (TanStack Query)                                      │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ Calls Server Action
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Server Action ('use server')                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  getArtists()                                          │ │
│  │  - Runs on server                                      │ │
│  │  - Has access to Prisma Client                         │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                         │
│                     ▼                                         │
│            ┌─────────────────┐                               │
│            │  Prisma Client  │                               │
│            └────────┬────────┘                               │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Database    │
              └───────────────┘
```

## File Structure

```
app/
  actions/                    # Server Actions (use Prisma directly)
    artists.ts                # Artist server actions
    art-pieces.ts             # Art piece server actions
  
hooks/
  use-artists.ts              # Client hooks (use Server Actions)
  use-art-pieces.ts           # Client hooks (use Server Actions)

components/
  nav-main.tsx                # Uses useArtists() hook
  create-artist-form.tsx      # Uses useCreateArtist() hook
  create-art-piece-form.tsx   # Uses useCreateArtPiece() hook
```

## Server Actions (`app/actions/`)

### `artists.ts`
```typescript
'use server'

import prisma from '@/prisma/client'

export async function getArtists() {
  return await prisma.artist.findMany({
    orderBy: { created_at: 'desc' }
  })
}

export async function createArtist(data: { name: string }) {
  const artist = await prisma.artist.create({
    data: { name: data.name }
  })
  revalidatePath('/dashboard') // Auto-refresh cached pages
  return artist
}
```

**Key features:**
- ✅ Direct Prisma Client access
- ✅ Type-safe (TypeScript)
- ✅ Runs on server (secure)
- ✅ Can use `revalidatePath` for cache invalidation

### `art-pieces.ts`
```typescript
'use server'

import prisma from '@/prisma/client'

export async function getArtPieces() {
  return await prisma.art_piece.findMany({
    orderBy: { created_at: 'desc' }
  })
}

export async function createArtPiece(data) {
  const artPiece = await prisma.art_piece.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      artist: {
        connect: { id: BigInt(data.artistId) }
      }
    }
  })
  revalidatePath('/dashboard')
  return artPiece
}
```

## Client Hooks (`hooks/`)

### `use-artists.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getArtists, createArtist } from '@/app/actions/artists'

export function useArtists() {
  return useQuery({
    queryKey: ['artists'],
    queryFn: getArtists,  // Calls server action
  })
}

export function useCreateArtist() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createArtist,  // Calls server action
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}
```

**Key features:**
- ✅ Simple API (no fetch boilerplate)
- ✅ Automatic caching
- ✅ Loading states
- ✅ Error handling
- ✅ Automatic refetch after mutations

## Usage in Components

### Fetching Data
```tsx
'use client'

import { useArtists } from '@/hooks/use-artists'

function ArtistList() {
  const { data: artists = [], isLoading, error } = useArtists()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <ul>
      {artists.map(artist => (
        <li key={artist.id.toString()}>{artist.name}</li>
      ))}
    </ul>
  )
}
```

### Creating Data
```tsx
'use client'

import { useCreateArtist } from '@/hooks/use-artists'

function CreateArtistForm() {
  const createArtist = useCreateArtist()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await createArtist.mutateAsync({ name: 'New Artist' })
      // Success! Data automatically refreshes
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="submit" 
        disabled={createArtist.isPending}
      >
        {createArtist.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

## Benefits of This Approach

### 1. **Direct Prisma Access** ✅
- Server actions use Prisma Client directly
- No need for API routes
- Type-safe database queries

### 2. **Better Performance** ⚡
- No API route overhead
- Fewer network roundtrips
- Built-in caching with TanStack Query

### 3. **Simpler Code** 📝
- Less boilerplate than API routes
- No need to handle request/response manually
- Automatic serialization

### 4. **Type Safety** 🔒
- End-to-end TypeScript
- Prisma types flow through to client
- Catch errors at compile time

### 5. **Better Developer Experience** 💡
- Auto-completion in IDE
- Easy to test
- Easier to maintain

## Comparison

### ❌ Old Way (API Routes)
```
Client Hook → fetch('/api/artists') → API Route → Prisma → DB
```
- More files
- Manual request/response handling
- No automatic type inference

### ✅ New Way (Server Actions)
```
Client Hook → Server Action → Prisma → DB
```
- Fewer files
- Automatic serialization
- Full type safety

## Important Notes

1. **Server Actions must be async functions** marked with `'use server'`
2. **BigInt values** are automatically serialized/deserialized
3. **revalidatePath()** invalidates Next.js cache (complementary to TanStack Query)
4. **Client components** can import and call server actions directly
5. **Still secure** - code runs on server, not exposed to browser

## Migration Complete! 🎉

You now have:
- ✅ Direct Prisma access in server actions
- ✅ TanStack Query for client state management
- ✅ Type-safe end-to-end
- ✅ No API routes needed
- ✅ Better performance and DX
