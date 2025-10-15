'use client'

import { useState } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
      <h2 className="text-2xl font-bold">Login</h2>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  )
}
