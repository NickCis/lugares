'use client';

import { useState, useEffect } from 'react';
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

const formSchema = z.object({
  email: z.string().email(),
});

function DeleteButton({ email, listId, onDelete }) {
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
            description: error.message,
          });
          setLoading(false);
        }
      }}
    >
      <Trash className="w-4 h-4" />
    </Button>
  );
}

async function fetchInvites(id, setInvites, cancelRef = {}) {
  const supabase = createClient();
  const { data } = await supabase
    .from('list_invites')
    .select()
    .eq('list_id', id);
  if (cancelRef.current) return;
  setInvites(data);
}

function Content({ id }) {
  const { toast } = useToast();
  const [invites, setInvites] =
    useState<{ list_id: string | number; email: string }[]>();

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
      if (e.code === '23505') {
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
        description: e.message || e.toString(),
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

export function ShareListDialog({ id, children, ...props }) {
  return (
    <Dialog {...props}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <Content id={id} />
      </DialogContent>
    </Dialog>
  );
}
