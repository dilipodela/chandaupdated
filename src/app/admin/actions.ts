'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function addMember(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const amount = formData.get('amount') as string
  const payment_method = formData.get('payment_method') as string
  const note = formData.get('note') as string
  const status = formData.get('status') as string

  if (!name || !amount || !payment_method) {
    return { error: 'Name, Amount, and Payment Method are required' }
  }

  const { error } = await supabase.from('members').insert([{
    name, amount, payment_method, note, status
  }])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function updateMemberStatus(id: string, newStatus: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('members').update({ status: newStatus }).eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function deleteMember(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('members').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const amount = formData.get('amount') as string
  const payment_method = formData.get('payment_method') as string
  const note = formData.get('note') as string
  const status = formData.get('status') as string

  if (!name || !amount || !payment_method) {
    return { error: 'Name, Amount, and Payment Method are required' }
  }

  const { error } = await supabase.from('members').update({
    name, amount, payment_method, note, status
  }).eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
