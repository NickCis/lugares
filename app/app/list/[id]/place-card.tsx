'use client';

import {
  useState,
  type ReactNode,
  type ComponentProps,
  type MouseEvent,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  MapPinned,
  Instagram,
  Link as LinkIcon,
  Phone,
  Mail,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WhatsApp } from '@/icons/whatsapp';

import { AddPlaceDialog } from './add-place-dialog';

// fix-vim-higlight = }

interface IconLinkProps {
  href: string;
}

function IconLink({ href }: IconLinkProps) {
  const Icon = href.match(/^\s*https?:\/\/(www\.)?instagram\.com/i)
    ? Instagram
    : href.match(
          /^s*https?:\/\/(maps\.app\.goo\.gl|(www\.?)google\.com\/maps|maps\.google\.com)/i,
        )
      ? MapPinned
      : href.match(/^\s*tel:/i)
        ? Phone
        : href.match(/^\s*mailto:/i)
          ? Mail
          : href.match(/^\s*https?:\/\/(wa\.me|api\.whatsapp\.com)/i)
            ? WhatsApp
            : LinkIcon;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <a
            href={href}
            target="_blank"
            rel="noopener"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'text-xs w-7 h-7',
            )}
          >
            <Icon className="w-4 h-4" />
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{href}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export interface ConfirmDeleteDialogProps
  extends ComponentProps<typeof AlertDialog> {
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
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (error) throw new Error(error.message);
      router.refresh();
      if (props.onOpenChange) props.onOpenChange(false);
      toast({
        description: 'The place has been deleted.',
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
            Are you sure you want to delete the place?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            place.
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

export interface PlaceCardProps {
  id: string | number;
  title: string;
  description: string;
  tags: string[];
  urls: string[];
  insertedAt: string;
  listId: string | number;
}

export function PlaceCard({
  id,
  title,
  description,
  tags,
  urls,
  insertedAt,
  listId,
}: PlaceCardProps) {
  const [dialog, setDialog] = useState<'delete' | 'edit'>();
  const href = `/app/list/${id}`;

  return (
    <>
      <ConfirmDeleteDialog
        id={id}
        open={dialog === 'delete'}
        onOpenChange={(open) => setDialog(open ? 'delete' : undefined)}
      />
      <AddPlaceDialog
        listId={listId}
        defaultValues={{
          id,
          title,
          description,
          tags,
          urls,
          // inserted_at: insertedAt,
          // list_id: listId,
        }}
        open={dialog === 'edit'}
        onOpenChange={(open) => setDialog(open ? 'edit' : undefined)}
        tags={tags}
      />

      <div className="flex flex-col items-start gap-2 rounded-lg border p-2 pt-0 pb-1 text-left text-sm transition-all w-full">
        <div className="flex w-full flex-col">
          <div className="flex items-center">
            <div className="flex items-center gap-2 flex-1 font-semibold overflow-hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="overflow-hidden">
                    <p className="font-semibold flex-1 truncate">{title}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-3 h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDialog('edit')}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialog('delete')}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center flex-wrap gap-1 w-full text-xs">
            {urls.map((url, index) => (
              <IconLink key={`${url}-${index}`} href={url} />
            ))}
          </div>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground flex-1">
          {description}
        </p>
        <div className="flex items-center flex-wrap gap-1 w-full">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="secondary"
              className="whitespace-nowrap"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}
