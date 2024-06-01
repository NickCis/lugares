import type { ReactElement } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: ReactElement;
}) {
  const supabase = createClient();
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {}

  if (!user) {
    redirect('/login');
    return;
  }

  return children;
}
