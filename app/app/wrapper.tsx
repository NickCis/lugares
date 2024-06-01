import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';
import { Mail } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

import { Wrapper as LayoutWrapper, Header, Logo } from '@/components/layout';
import { LogOutButton } from '@/components/log-out-button';
import { InvitesDialog } from './invites-dialog';

// fix-vim-highlight = }

export async function Wrapper({ children }: { ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: invites } = await supabase
    .from('list_invites')
    .select('*, lists(*)')
    .eq('email', user.email);

  return (
    <LayoutWrapper>
      <Header>
        <Logo href="/app" />
        <div className="flex-1" />
        <div className="flex space-x-2">
          <InvitesDialog invites={invites} user={user}>
            <Button
              size="icon"
              variant="ghost"
              className="relative"
              disabled={invites.length === 0}
            >
              <Mail className="w-4 h-4" />
              {invites.length > 0 ? (
                <span className="absolute h-2 w-2 top-2 right-2 rounded-full bg-red-600" />
              ) : null}
            </Button>
          </InvitesDialog>
          <LogOutButton />
        </div>
      </Header>
      {children}
    </LayoutWrapper>
  );
}
