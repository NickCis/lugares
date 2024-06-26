'use client';

import {
  useState,
  useEffect,
  type ReactNode,
  type ComponentProps,
} from 'react';
import { Send, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

import type { InviteWithList } from '@/interfaces/invite';
import type { User } from '@/interfaces/user';

// fix-vim-highlight = }

interface AcceptButtonProps {
  invite: InviteWithList;
  onDone: () => void;
  userId: User['id'];
}

function AcceptButton({ invite, onDone, userId }: AcceptButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      variant="ghost"
      size="icon"
      className="text-green-500"
      onClick={async () => {
        try {
          const supabase = createClient();
          let { error } = await supabase.from('list_owners').insert({
            list_id: invite.list_id,
            user_id: userId,
          });
          if (error) throw error;

          error = (
            await supabase
              .from('list_invites')
              .delete()
              .eq('list_id', invite.list_id)
              .eq('email', invite.email)
          ).error;

          if (error) throw error;
          onDone();
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: (error as Error).message,
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <Check className="w-4 h-4" />
    </Button>
  );
}

interface DeleteButtonProps {
  invite: InviteWithList;
  onDone: () => void;
}

function DeleteButton({ invite, onDone }: DeleteButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      variant="ghost"
      size="icon"
      className="text-destructive"
      onClick={async () => {
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from('list_invites')
            .delete()
            .eq('list_id', invite.list_id)
            .eq('email', invite.email);

          if (error) throw error;
          onDone();
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: (error as Error).message,
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <X className="w-4 h-4" />
    </Button>
  );
}

interface ContentProps {
  invites: InviteWithList[];
  user: User;
}

function Content({ invites, user }: ContentProps) {
  const router = useRouter();
  const handleClick = () => {
    router.refresh();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Invites</DialogTitle>
      </DialogHeader>
      {invites ? (
        <div className="space-y-1">
          {invites.map((invite) => (
            <div
              className="flex items-center items-center"
              key={invite.list_id}
            >
              <div className="flex-1 text-sm flex flex-col">
                <div className="text-sm">{invite.lists.title}</div>
                <div className="text-xs text-gray-500">
                  {invite.lists.description}
                </div>
              </div>
              <AcceptButton
                userId={user.id}
                invite={invite}
                onDone={handleClick}
              />
              <DeleteButton invite={invite} onDone={handleClick} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm">Loading...</div>
      )}
    </>
  );
}

export interface InvitesDialogProps extends ComponentProps<typeof Dialog> {
  invites: InviteWithList[];
  user: User;
  children?: ReactNode;
}

export function InvitesDialog({
  invites,
  children,
  user,
  ...props
}: InvitesDialogProps) {
  return (
    <Dialog {...props}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <Content invites={invites} user={user} />
      </DialogContent>
    </Dialog>
  );
}
