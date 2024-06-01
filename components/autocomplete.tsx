'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { normalize } from '@/lib/string';

export function Item({
  value,
  onSelect,
  children,
  checked,
  selected,
  ...props
}) {
  return (
    <div
      {...props}
      data-selected={selected}
      aria-selected={selected}
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
    >
      <Check
        className={cn('mr-2 h-4 w-4', checked ? 'opacity-100' : 'opacity-0')}
      />

      {children}
    </div>
  );
}

function getSelectedIndex(
  filteredLength: number,
  selected: number | null,
): number | null {
  if (selected === null) return selected;
  return selected < 0
    ? (filteredLength + (selected % filteredLength)) % filteredLength
    : selected % filteredLength;
}

function filterTags(options, value) {
  return options
    .filter((tag) => !value || normalize(tag).startsWith(value))
    .slice(0, 20);
}

function Content({
  options,
  input,
  value,
  values,
  selected,
  onSelect,
  onCheck,
  empty,
}) {
  const filtered = filterTags(options, value);

  if (filtered.length)
    return filtered.map((tag, index) => (
      <Item
        onMouseEnter={() => onSelect(index)}
        key={`${tag}-${index}`}
        checked={values.includes(tag)}
        selected={index === getSelectedIndex(filtered.length, selected)}
        value={tag}
        onClick={() => onCheck(tag)}
      >
        {tag}
      </Item>
    ));

  if (typeof empty === 'function') return empty({ value, input, options });

  return <Item>{empty}</Item>;
}

export function Autocomplete({
  options,
  values,
  setValues,
  Component = 'input',
  empty = 'Not found.',
  onCreateOption,
  ...rest
}) {
  const [value, setValue] = useState<{
    value: string;
    label: string;
    selected: null | number;
  }>({
    value: '',
    label: '',
    selected: null,
  });
  const [open, setOpen] = useState<{ open: boolean; focus: boolean }>({
    open: false,
    focus: false,
    popover: false,
  });

  function handleCheck(tag: string, selected: null | number = null) {
    setValue({
      label: '',
      value: '',
      selected,
    });
    setValues((values) =>
      values.includes(tag)
        ? values.filter((val) => val !== tag)
        : [...values, tag],
    );
  }

  return (
    <Popover
      open={open.open}
      onOpenChange={(op) =>
        setOpen((o) => ({
          ...o,
          open: op || o.focus,
          popover: op,
        }))
      }
    >
      <PopoverAnchor asChild>
        <Component
          {...rest}
          onFocus={() => {
            setOpen({ open: true, focus: true, popover: true });
            setValue((v) => ({ ...v, selected: null }));
          }}
          onBlur={() =>
            setOpen((o) => ({ ...o, focus: false, open: o.popover }))
          }
          value={value.label}
          onChange={(e) => {
            setValue({
              label: e.target.value,
              value: normalize(e.target.value),
              selected: null,
            });
            if (!open.open) setOpen((o) => ({ ...o, open: true }));
          }}
          onKeyDown={(event) => {
            if (
              event.code === 'Escape' ||
              event.key === 'Escape' ||
              event.keyCode === 27 ||
              event.which === 27
            ) {
              setValue((v) => ({
                ...v,
                selected: null,
              }));
              setOpen((o) => ({ ...o, open: false }));
              return;
            }
            if (
              event.code === 'ArrowDown' ||
              event.key === 'ArrowDown' ||
              event.keyCode === 40 ||
              event.which === 40
            ) {
              setValue((v) => ({
                ...v,
                selected: v.selected === null ? 0 : v.selected + 1,
              }));
              return;
            }

            if (
              event.code === 'ArrowUp' ||
              event.key === 'ArrowUp' ||
              event.keyCode === 38 ||
              event.which === 38
            ) {
              setValue((v) => ({ ...v, selected: (v.selected || 0) - 1 }));
              return;
            }
          }}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              const filtered = filterTags(options, value.value);
              if (filtered.length > 0) {
                const index =
                  getSelectedIndex(filtered.length, value.selected) || 0;
                const v = filtered[index];
                handleCheck(v, value.selected);
              } else if (onCreateOption) {
                onCreateOption(value.label);
                setValue({
                  label: '',
                  value: '',
                  selected: null,
                });
              }
            }
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="p-1 w-[--radix-popover-trigger-width]"
      >
        <Content
          options={options}
          input={value.label}
          value={value.value}
          values={values}
          selected={value.selected}
          onSelect={(selected) => setValue((v) => ({ ...v, selected }))}
          onCheck={(tag) => handleCheck(tag)}
          empty={empty}
        />
      </PopoverContent>
    </Popover>
  );
}
