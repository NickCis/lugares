import type { ReactNode } from 'react';
import Link from 'next/link';
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TagBadge({
  value,
  filters,
  children,
  url,
  ...props
}: {
  value: string;
  filters: string[];
  children: ReactNode;
}) {
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
