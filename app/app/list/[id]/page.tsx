import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Map } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Content } from '@/components/layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Wrapper } from '@/app/app/wrapper';
import type { Place } from '@/interfaces/place';

import { get } from './data';
import { AddPlaceDialog } from './add-place-dialog';
import { PlaceCard } from './place-card';
import { TagFilter } from './tag-filter';
import { TagBadge } from './tag-badge';

export interface ListProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function List({ params, searchParams }: ListProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const listId = params.id;

  const { list, places, tags, availableTags, filters } = await get(
    listId,
    searchParams.tags || [],
  );

  if (!list) {
    redirect('/app');
    return;
  }

  const url = `/app/list/${listId}`;

  return (
    <Wrapper>
      <Content className="w-full max-w-4xl pt-6 px-2 lg:px-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">{list.title}</h2>
          <div className="flex items-center space-x-2">
            <Link
              className={buttonVariants({ variant: 'outline', size: 'icon' })}
              href={`${url}/map`}
            >
              <Map className="h-4 w-4" />
            </Link>
            <AddPlaceDialog listId={listId} tags={tags}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Place
              </Button>
            </AddPlaceDialog>
          </div>
        </div>
        <div className="mb-2">
          <TagFilter tags={availableTags} url={url} filters={filters} />
        </div>
        <div className="flex flex-wrap mb-2 -mx-1">
          {filters.map((filter, index) => (
            <TagBadge
              url={url}
              key={`${filter}-${index}`}
              className="m-1"
              value={filter}
              filters={filters}
            >
              {filter}
            </TagBadge>
          ))}
        </div>
        <div className="flex flex-wrap -mx-1">
          {places.map((place) => (
            <div className="w-full sm:w-1/2 md:w-1/3 p-1 flex" key={place.id}>
              <PlaceCard
                id={place.id}
                title={place.title}
                description={place.description}
                tags={place.tags}
                urls={place.urls}
                insertedAt={place.inserted_at}
                listId={place.list_id}
                allTags={tags}
              />
            </div>
          ))}
        </div>
      </Content>
    </Wrapper>
  );
}
