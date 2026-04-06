'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Member {
  id: string;
  name: string;
  amount: number | string;
  payment_method: string;
  note: string;
  status: string;
}

const cardStyles = [
  { light: 'bg-blue-100/70 border-blue-200', dark: 'dark:bg-blue-950/40 dark:border-blue-900/30' },
  { light: 'bg-emerald-100/70 border-emerald-200', dark: 'dark:bg-emerald-950/40 dark:border-emerald-900/30' },
  { light: 'bg-amber-100/70 border-amber-200', dark: 'dark:bg-amber-950/40 dark:border-amber-900/30' },
  { light: 'bg-rose-100/70 border-rose-200', dark: 'dark:bg-rose-950/40 dark:border-rose-900/30' },
  { light: 'bg-purple-100/70 border-purple-200', dark: 'dark:bg-purple-950/40 dark:border-purple-900/30' },
  { light: 'bg-indigo-100/70 border-indigo-200', dark: 'dark:bg-indigo-950/40 dark:border-indigo-900/30' },
];

import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardClient({ initialMembers }: { initialMembers: Member[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = initialMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chanda Dashboard
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[100px] sm:w-64 sm:flex-initial"
            />
            <ThemeToggle />
            <Link href="/login" className="block">
              <Button variant="outline" size="sm" className="whitespace-nowrap px-2 sm:px-4">Admin Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member, index) => {
            const style = cardStyles[index % cardStyles.length];
            return (
              <Card
                key={member.id}
                className={cn(
                  "overflow-hidden border shadow-sm transition-all hover:shadow-md hover:scale-[1.02]",
                  style.light,
                  style.dark
                )}
              >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold dark:text-slate-100">{member.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="font-medium">Amount:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">₹{member.amount}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="font-medium">Method:</span>
                  <span className="dark:text-slate-300">{member.payment_method}</span>
                </div>
                {member.note && (
                  <div className="flex flex-col pt-1">
                    <span className="font-medium text-xs dark:text-slate-500">Note:</span>
                    <span className="italic dark:text-slate-300">{member.note}</span>
                  </div>
                )}
                <div className={`mt-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${member.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {member.status}
                </div>
              </CardContent>
            </Card>
          )})}
          {filteredMembers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
              No members found matching "{searchQuery}"
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
