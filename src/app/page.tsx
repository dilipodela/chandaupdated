import { createClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/DashboardClient';

// Server Component (SSR)
export default async function PublicDashboardPage() {
  const supabase = await createClient();

  // Fetch members directly on the server
  const { data: members, error } = await supabase.from('members').select('*');

  if (error) {
    return <div className="p-8 text-red-500">Failed to load members: {error.message}</div>;
  }

  // Pass members down to client component for interactive search
  return <DashboardClient initialMembers={members || []} />;
}
