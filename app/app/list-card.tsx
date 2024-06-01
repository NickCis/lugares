'use client';

import {
  useState,
  type ReactNode,
  type ComponentProps,
  type MouseEvent,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { Lock, Earth, EllipsisVertical, MoreVertical } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ShareListDialog } from './share-list-dialog';

// fix-vim-highlight = }

interface ConfirmDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  children?: ReactNode;
  id: string | number;
}
export function ConfirmDeleteDialog({
  children,
  id,
  ...props
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onClick = async (event: MouseEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) throw new Error('Not logged in');
      const user = data.user;
      const { error } = await supabase
        .from('list_owners')
        .delete()
        .eq('list_id', id)
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      router.refresh();
      if (props.onOpenChange) props.onOpenChange(false);
      toast({
        description: 'The list has been deleted.',
      });
    } catch (e) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: (e as Error).message || (e as Error).toString(),
      });
    }
  };

  return (
    <AlertDialog {...props}>
      {children ? (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete the list?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={onClick}>
            {loading ? 'Deleting...' : 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface ListCardProps {
  id: string | number;
  title: string;
  description: string;
  isPrivate: boolean;
  insertedAt: string;
}

export function ListCard({
  id,
  title,
  description,
  isPrivate,
  insertedAt,
}: ListCardProps) {
  const [dialog, setDialog] = useState<'delete' | 'share'>();
  const Icon = isPrivate ? Lock : Earth;
  const href = `/app/list/${id}`;

  return (
    <>
      <ConfirmDeleteDialog
        id={id}
        open={dialog === 'delete'}
        onOpenChange={(open) => setDialog(open ? 'delete' : undefined)}
      />
      <ShareListDialog
        id={id}
        open={dialog === 'share'}
        onOpenChange={(open) => setDialog(open ? 'share' : undefined)}
      />
      <div className="flex flex-col items-start gap-2 rounded-lg border p-3 pt-0 text-left text-sm transition-all hover:bg-accent w-full">
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center">
            <div className="flex items-center gap-2 flex-1">
              <Icon className="h-4 w-4 font-semibold" />
              <Link className="font-semibold flex-1" href={href}>
                {title}
              </Link>
            </div>
            {/*<div className="ml-auto text-xs text-muted-foreground pr-2">
              {formatDistanceToNow(new Date(insertedAt), {
                addSuffix: true,
              })}
            </div> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-3 h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDialog('share')}>
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialog('delete')}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/*<div className="text-xs font-medium">{subTitle}</div>*/}
        </div>
        <Link
          className="line-clamp-2 text-xs text-muted-foreground"
          href={href}
        >
          {description}
        </Link>
      </div>
    </>
  );
}
