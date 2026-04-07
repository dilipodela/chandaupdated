'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        setIsRecoveryMode(true)
        setSessionChecked(true)
        return
      }

      // 2. Check URL for tokens and manually set session if found
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash || window.location.search)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (!error) {
            setIsRecoveryMode(true)
          } else {
            console.error('Error setting session from URL:', error)
          }
        } else if (type === 'recovery' || params.has('code')) {
           // If we have signs of recovery but tokens haven't processed yet, wait a bit
           setIsRecoveryMode(true)
        }
      }
      setSessionChecked(true)
    }

    handleAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event change:', event)
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) {
        setIsRecoveryMode(true)
      }
    })

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

    // Verify session actually exists right now
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Auth session missing! Please click the link in your email again.')
      setLoading(false)
      return
    }

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
              Waiting for recovery session... If nothing happens, your link may be invalid or expired.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">New Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                </div>
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

