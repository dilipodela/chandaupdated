'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) console.error('Session check error:', error)
        if (session) {
          console.log('Session found on mount:', session.user.email)
          setIsRecoveryMode(true)
        }
      } catch (err) {
        console.error('Failed to get session:', err)
      }
    }
    
    checkSession()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event changed:', event, session ? 'with session' : 'no session')
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) {
        setIsRecoveryMode(true)
      }
    })

    // Fallback: Check URL for recovery tokens (Hash or Query Params)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const search = window.location.search
      console.log('Checking URL for tokens... Hash:', hash ? 'Present' : 'Empty', 'Search:', search ? 'Present' : 'Empty')
      
      if (
        hash.includes('type=recovery') || 
        hash.includes('access_token=') || 
        search.includes('type=recovery') ||
        search.includes('code=') // PKCE flow
      ) {
        console.log('Recovery-related tokens detected in URL')
        setIsRecoveryMode(true)
      }
    }

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully! Redirecting...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <Card className="w-full max-w-sm shadow-lg border-none dark:border dark:border-slate-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isRecoveryMode ? (
            <p className="text-sm text-yellow-600 text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-md">
              Waiting for recovery session... If nothing happens, your link may be invalid.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">New Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t p-4 pb-4">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            &larr; Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
