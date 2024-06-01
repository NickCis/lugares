import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Content } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { normalize } from '@/lib/string';
import { Wrapper } from '@/app/app/wrapper';
import type { Place } from '@/interfaces/place';

import { AddPlaceDialog } from './add-place-dialog';
import { PlaceCard } from './place-card';
import { TagFilter } from './tag-filter';
import { TagBadge } from './tag-badge';

function getTags(places: Place[]): string[] {
  const set = new Set<string>();
  for (const place of places) {
    for (const tag of place.tags) {
      set.add(tag);
    }
  }

  const entries = Array.from(set);
  entries.sort((a, b) => a.localeCompare(b));

  return entries;
}

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
  const { data } = await supabase
    .from('lists')
    .select('*, places(*)')
    .eq('id', listId);

  const list = data?.[0];

  if (!list) {
    redirect('/app');
    return;
  }

  const tags = getTags(list.places);
  let places = list.places as Place[];

  let filters: string[] = [];
  if (searchParams.tags) {
    filters = Array.isArray(searchParams.tags)
      ? searchParams.tags
      : [searchParams.tags];

    places = places.filter(({ tags }) =>
      filters.every((f) => {
        const n = normalize(f);
        return tags.some((t) => normalize(t) === n);
      }),
    );
  }

  const url = `/app/list/${listId}`;

  return (
    <Wrapper>
      <Content className="w-full max-w-4xl pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">{list.title}</h2>
          <div className="flex items-center space-x-2">
            <AddPlaceDialog listId={listId} tags={tags}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Place
              </Button>
            </AddPlaceDialog>
          </div>
        </div>
        <div className="mb-2">
          <TagFilter tags={tags} url={url} filters={filters} />
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
              />
            </div>
          ))}
        </div>
      </Content>
    </Wrapper>
  );
}
