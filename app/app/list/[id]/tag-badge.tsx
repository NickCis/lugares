import type { ReactNode, ComponentProps } from 'react';
import Link from 'next/link';
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface TagBadgeProps extends ComponentProps<typeof Badge> {
  value: string;
  filters: string[];
  children: ReactNode;
  url: string;
}

export function TagBadge({
  value,
  filters,
  children,
  url,
  ...props
}: TagBadgeProps) {
  const mapped = filters
    .filter((f) => f !== value)
    .map((v) => `tags=${encodeURIComponent(v)}`)
    .join('&');

  return (
    <Badge {...props}>
      {children}
      <Link className="ml-1" href={mapped ? `${url}?${mapped}` : url}>
        <Trash className="w-3 h-3" />
      </Link>
    </Badge>
  );
}
