import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/AdminClient'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all members to pass to the client component
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false }) // Fallback, assuming created_at exists. If not, it falls back gracefully or errors. let's just use simple select.

  let safeMembers = members || []
  if (error) {
    // If order fails because created_at doesn't exist, just select '*'.
    const fallback = await supabase.from('members').select('*')
    safeMembers = fallback.data || []
  }

  return <AdminClient initialMembers={safeMembers} user={user} />
}
