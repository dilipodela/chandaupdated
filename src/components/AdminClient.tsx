'use client'

import { useState, useTransition } from 'react'
import { default as NextLink } from 'next/link'
import { addMember, updateMemberStatus, deleteMember, logout, updateMember } from '@/app/admin/actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Member } from '@/components/DashboardClient'

import { ThemeToggle } from '@/components/ThemeToggle'

export default function AdminClient({ initialMembers, user }: { initialMembers: Member[], user: any }) {
  const [isPending, startTransition] = useTransition()
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = initialMembers.filter((m) => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.note && m.note.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addMember(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Member added successfully!")
      }
    })
  }

  async function handleUpdate(formData: FormData) {
    if (!editingMember) return
    startTransition(async () => {
      const result = await updateMember(editingMember.id, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Member updated successfully!")
        setEditingMember(null)
      }
    })
  }

  async function handleStatusToggle(id: string, currentStatus: string) {
    startTransition(async () => {
      const newStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending'
      const result = await updateMemberStatus(id, newStatus)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Marked as ${newStatus}`)
      }
    })
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this member?")) return
    startTransition(async () => {
      const result = await deleteMember(id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Member deleted!")
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-sm text-slate-500 hidden sm:inline-block">Logged in as {user.email}</span>
            <ThemeToggle />
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">Logout</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8">
        
        {/* Quick Actions & Add/Edit Member Form */}
        <section className="grid md:grid-cols-2 gap-8">
          {!editingMember ? (
            <Card className="border-none shadow-md dark:border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Add New Member</CardTitle>
                <CardDescription>Enter details to record a new chanda contribution.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input name="name" required placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount</label>
                      <Input name="amount" type="number" required placeholder="500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method</label>
                      <Input name="payment_method" required placeholder="Cash, UPI..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select name="status" className="flex h-10 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 transition-colors">
                        <option value="Pending" className="dark:bg-slate-900">Pending</option>
                        <option value="Paid" className="dark:bg-slate-900">Paid</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note (Optional)</label>
                    <Input name="note" placeholder="Any additional remarks..." />
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                    {isPending ? 'Adding...' : 'Add Member'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card key={editingMember.id} className="border-none shadow-md bg-blue-50/30 dark:bg-blue-900/10 dark:border dark:border-blue-900/20">
              <CardHeader>
                <CardTitle className="dark:text-blue-100">Edit Member</CardTitle>
                <CardDescription className="dark:text-blue-300/70">Update details for {editingMember.name}.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input name="name" defaultValue={editingMember.name} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount</label>
                      <Input name="amount" type="number" defaultValue={editingMember.amount} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method</label>
                      <Input name="payment_method" defaultValue={editingMember.payment_method} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select name="status" defaultValue={editingMember.status} className="flex h-10 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 transition-colors">
                        <option value="Pending" className="dark:bg-slate-900">Pending</option>
                        <option value="Paid" className="dark:bg-slate-900">Paid</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note (Optional)</label>
                    <Input name="note" defaultValue={editingMember.note} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isPending} className="flex-1">
                      {isPending ? 'Updating...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-md dark:border dark:border-slate-800">
            <CardHeader>
              <CardTitle>Administration</CardTitle>
              <CardDescription>Shortcuts and account management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                  <h3 className="font-semibold text-lg flex items-center justify-between">
                     Change Password 
                     <NextLink href="/admin/change-password" className="text-sm font-normal text-blue-600 dark:text-blue-400 hover:underline">Go &rarr;</NextLink>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your admin account password in a secure isolated environment.</p>
               </div>
               
               <div className="rounded-lg border border-border p-4 bg-muted/30">
                  <p className="text-sm font-medium mb-2 dark:text-slate-300">Total Members: {initialMembers.length}</p>
                  <p className="text-sm font-medium mb-2 dark:text-slate-300">Total Paid Revenue: ₹{initialMembers.filter(m => m.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0)}</p>
               </div>
            </CardContent>
          </Card>
        </section>

        {/* Member Table */}
        <Card className="border-none shadow-md overflow-hidden dark:border dark:border-slate-800">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
            <CardTitle>Member Directory</CardTitle>
            <div className="w-full sm:max-w-sm">
              <Input 
                placeholder="Search name, method, or note..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                      {searchQuery ? `No matches found for "${searchQuery}"` : "No members recorded yet."}
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.map((member) => (
                  <TableRow key={member.id} className={editingMember?.id === member.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}>
                    <TableCell className="font-medium dark:text-slate-200">{member.name}</TableCell>
                    <TableCell className="dark:text-slate-300">{member.amount}</TableCell>
                    <TableCell className="dark:text-slate-300">{member.payment_method}</TableCell>
                    <TableCell className="dark:text-slate-400">{member.note}</TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleStatusToggle(member.id, member.status)}
                        disabled={isPending}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${
                          member.status === 'Paid' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40'
                        }`}
                      >
                        {member.status}
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="sm" onClick={() => setEditingMember(member)}>Edit</Button>
                       <Button variant="destructive" size="sm" disabled={isPending} onClick={() => handleDelete(member.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

      </main>
    </div>
  )
}
