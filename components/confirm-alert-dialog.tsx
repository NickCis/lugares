'use client';

import {
  useState,
  type ReactNode,
  type MouseEvent,
  type ComponentProps,
} from 'react';
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

// fix-vim-highlight = }

export interface ConfirmAlertDialogProps
  extends ComponentProps<typeof AlertDialog> {
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  cancel?: ReactNode;
  children?: ReactNode;
  onCancel?: (ev: MouseEvent<HTMLButtonElement>) => void;
  onAction?: (event: MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export function ConfirmAlertDialog({
  title,
  description,
  onCancel,
  onAction,
  action = 'Accept',
  cancel = 'Cancel',
  children,
  ...rest
}: ConfirmAlertDialogProps) {
  const [loading, setLoading] = useState(false);
  return (
    <AlertDialog {...rest}>
      {children ? (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={loading}>
            {cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={async (event) => {
              if (onAction) {
                try {
                  setLoading(true);
                  await onAction(event);
                } finally {
                  setLoading(false);
                }
              }
            }}
          >
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
