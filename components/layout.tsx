import { type PropsWithChildren } from 'react';
import { type ClassValue } from 'clsx';
import Link, { LinkProps } from 'next/link';
import { LandPlot } from 'lucide-react';
import { cn } from '@/lib/utils';

// fix-vim-highligh = }

export function Wrapper({
  children,
  className,
}: PropsWithChildren<{ className?: ClassValue }>) {
  return (
    <div className={cn('flex-1 flex w-full flex-col items-center', className)}>
      {children}
    </div>
  );
}

export function Header({ children }: PropsWithChildren<{}>) {
  return (
    <div className="w-full flex justify-center border-b border-b-foreground/10 h-14">
      <nav className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
        {children}
      </nav>
    </div>
  );
}

export function Logo({
  className,
  ...props
}: Omit<LinkProps, 'href'> & { href?: LinkProps['href'] } & {
  className?: string;
}) {
  return (
    <Link
      className={cn('flex items-center text-lg font-medium', className)}
      href="/"
      {...props}
    >
      <LandPlot className="mr-2 h-6 w-6" />
      Lugares
    </Link>
  );
}

export function Content({
  className,
  children,
}: PropsWithChildren<{ className?: ClassValue }>) {
  return <div className={cn('flex-1 w-full', className)}>{children}</div>;
}
