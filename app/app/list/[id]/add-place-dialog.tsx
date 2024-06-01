'use client';

import { forwardRef, useState, useRef, useEffect, type ReactNode } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Autocomplete, Item } from '@/components/autocomplete';

// fix-vim-highlight = }

// https://react-hook-form.com/docs/usefieldarray
// https://github.com/shadcn-ui/ui/issues/2760

const formSchema = z.object({
  id: z.any().optional(),
  title: z.string().min(1).max(50),
  description: z.string(),
  tags: z.array(z.string()),
  urls: z.array(z.string().url()),
});

function InputWithAction({
  onAction,
  disabled,
  placeholder,
}: {
  placeholder?: string;
  onAction: (v: string) => void;
  disabled?: boolean;
}) {
  const ref = useRef();
  return (
    <div className="w-full flex space-x-1">
      <Input
        placeholder={placeholder}
        className="flex-1"
        disabled={disabled}
        ref={ref}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onAction(event.target.value);
            event.target.value = '';
          }
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          if (!ref.current) return;
          onAction(ref.current.value);
          ref.current.value = '';
        }}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

const InputForAutocomplete = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="w-full flex space-x-1">
      <Input ref={ref} className="flex-1" {...props} />
      <Button
        variant="ghost"
        size="icon"
        disabled={props.disabled}
        onClick={(event) => {
          event.preventDefault();
          if (!ref.current) return;
          if (!props.onKeyPress) return;
          props.onKeyPress({
            target: ref.current,
            key: 'Enter',
          });
        }}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
});

InputForAutocomplete.displayName = 'InputForAutocomplete';

const DefaultValues = {
  id: '',
  title: '',
  description: '',
  tags: [],
  urls: [],
};

function Content({
  onClose,
  listId,
  tags,
  defaultValues = DefaultValues,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const tagsField = useFieldArray({
    control: form.control,
    name: 'tags',
  });
  const urlsField = useFieldArray({
    control: form.control,
    name: 'urls',
  });
  const isSubmitting = form.formState.isSubmitting;
  const errors = form.formState.errors;
  console.log('form.getValues(tags)', form.getValues('tags'));

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient();
    if (values.id) {
      const { error } = await supabase
        .from('places')
        .update({
          title: values.title,
          description: values.description,
          tags: values.tags,
          urls: values.urls,
          list_id: listId,
        })
        .eq('id', values.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('places').insert({
        title: values.title,
        description: values.description,
        tags: values.tags,
        urls: values.urls,
        list_id: listId,
      });

      if (error) throw error;
    }
    router.refresh();
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>{`${defaultValues.id ? 'Edit' : 'Add'} new place`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4 pb-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Title"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description..."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex flex-wrap -mt-1 -mr-1 -ml-1">
                {tagsField.fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`tags.${index}`}
                    render={({ field }) => (
                      <Badge variant="outlined" className="m-1 mb-0">
                        {field.value}
                        <button
                          className="ml-1 text-destructive"
                          onClick={() => tagsField.remove(index)}
                          disabled={isSubmitting}
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  />
                ))}
              </div>
              <Autocomplete
                options={tags}
                values={form.getValues('tags')}
                Component={InputForAutocomplete}
                placeholder="Enter new tag..."
                disabled={isSubmitting}
                empty={({ input }) => (
                  <Item>
                    Create new tag <i className="ml-1">'{input}'</i>.
                  </Item>
                )}
                setValues={(f) => {
                  const values = form.getValues('tags');
                  const next = typeof f === 'function' ? f(values) : f;
                  if (values.length > next.length) {
                    const removed = values.findIndex((v) => !next.includes(v));
                    if (removed > -1) tagsField.remove(removed);
                  } else if (values.length < next.length) {
                    tagsField.append(next[next.length - 1]);
                  }
                }}
                onCreateOption={(value) => {
                  tagsField.append(value);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>URLs</Label>
            <div className="flex flex-col space-y-2">
              {urlsField.fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`urls.${index}`}
                  render={({ field }) => (
                    <div className="space-y-1">
                      <div className="w-full flex space-x-1">
                        <Input
                          className="flex-1"
                          disabled={isSubmitting}
                          {...field}
                        />
                        <Button
                          className="text-destructive"
                          variant="ghost"
                          size="icon"
                          disabled={isSubmitting}
                          onClick={() => urlsField.remove(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormMessage className="text-xs" />
                    </div>
                  )}
                />
              ))}
              <InputWithAction
                placeholder="Enter new url..."
                disabled={isSubmitting}
                onAction={(value) => {
                  if (!value) return;
                  urlsField.append(value);
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {defaultValues.id ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function AddPlaceDialog({
  listId,
  children,
  defaultValues,
  tags,
  ...props
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-[425px]">
        <Content
          listId={listId}
          onClose={() => {
            if (props.onOpenChange) {
              props.onOpenChange(false);
              return;
            }

            setOpen(false);
          }}
          defaultValues={defaultValues}
          tags={tags}
        />
      </DialogContent>
    </Dialog>
  );
}
