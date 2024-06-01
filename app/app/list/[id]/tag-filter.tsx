'use client';

import { forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Autocomplete } from '@/components/autocomplete';
import { cn } from '@/lib/utils';

const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="flex items-center rounded-lg border px-3" ref={ref}>
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        placeholder="Search by tag..."
        className={cn(
          'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export interface TagFilterProps {
  tags: string[];
  filters: string[];
  url: string;
}

export function TagFilter({ tags, filters, url }: TagFilterProps) {
  const router = useRouter();
  function setValues(f: string[] | ((v: string[]) => string[])) {
    const next = typeof f === 'function' ? f(filters) : f;
    const mapped = next.map((v) => `tags=${encodeURIComponent(v)}`).join('&');
    router.push(mapped ? `${url}?${mapped}` : url);
  }
  return (
    <Autocomplete
      options={tags}
      values={filters}
      setValues={setValues}
      Component={Input}
      empty="No tag found."
    />
  );
}
