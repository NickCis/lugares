'use client';

import {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Send, Trash } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

import type { Invite } from '@/interfaces/invite';

// fix-vim-highlight = }

const formSchema = z.object({
  email: z.string().email(),
});

interface DeleteButtonProps {
  email: string;
  listId: string | number;
  onDelete: () => void;
}

function DeleteButton({ email, listId, onDelete }: DeleteButtonProps) {
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
          setLoading(true);
          const supabase = createClient();
          const { error } = await supabase
            .from('list_invites')
            .delete()
            .eq('list_id', listId)
            .eq('email', email);

          if (error) throw error;
          onDelete();
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: (error as Error).message,
          });
          setLoading(false);
        }
      }}
    >
      <Trash className="w-4 h-4" />
    </Button>
  );
}

async function fetchInvites(
  id: string | number,
  setInvites: Dispatch<SetStateAction<Invite[] | undefined>>,
  cancelRef: { current?: boolean } = {},
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('list_invites')
    .select()
    .eq('list_id', id);
  if (cancelRef.current) return;
  if (error) throw new Error(error.message);
  if (data) setInvites(data);
}

interface ContentProps {
  id: number | string;
}

function Content({ id }: ContentProps) {
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>();

  useEffect(() => {
    const cancelRef = {
      current: false,
    };
    fetchInvites(id, setInvites, cancelRef);
    return () => {
      cancelRef.current = true;
    };
  }, [id]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('list_invites').insert({
        list_id: id,
        email: values.email,
      });

      if (error) throw error;
      fetchInvites(id, setInvites);
    } catch (e) {
      if ((e as any)?.code === '23505') {
        // duplicate
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'The email already has an invite!',
        });
        return;
      }

      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: (e as Error).message || (e as Error).toString(),
      });

      fetchInvites(id, setInvites);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Share list</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          className="grid flex-1 gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Label htmlFor="share-email">Add people to the list</Label>
          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <Input
                  placeholder="email@example.com"
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />

            <Button
              type="submit"
              size="sm"
              className="px-3"
              disabled={isSubmitting}
            >
              <span className="sr-only">Copy</span>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
      <div className="">
        <h3 className="mb-2 text-base">Pending invites</h3>
        {invites ? (
          <div className="space-y-1">
            {invites.map((invite) => (
              <div
                className="flex items-center items-center"
                key={invite.email}
              >
                <div className="flex-1 text-sm">{invite.email}</div>
                <DeleteButton
                  email={invite.email}
                  listId={id}
                  onDelete={() => fetchInvites(id, setInvites)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm">Loading...</div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

export interface ShareListDialogProps extends ComponentProps<typeof Dialog> {
  id: number | string;
  children?: ReactNode;
}

export function ShareListDialog({
  id,
  children,
  ...props
}: ShareListDialogProps) {
  return (
    <Dialog {...props}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <Content id={id} />
      </DialogContent>
    </Dialog>
  );
}
