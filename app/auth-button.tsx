import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { LogOutButton } from '@/components/log-out-button';

export async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-2">
      <Link href="/app" className={buttonVariants({ variant: 'outline' })}>
        Lists
      </Link>
      <LogOutButton />
    </div>
  ) : (
    <Link href="/login" className={buttonVariants()}>
      Login
    </Link>
  );
}
