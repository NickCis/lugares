import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import https from 'node:https';

async function download(url: string): Promise<string> {
  return await new Promise((rs, rj) => {
    https
      .get(url, async (res) => {
        if (res.headers.location) {
          rs(await download(res.headers.location));
          return;
        }

        res.on('error', (e) => rj(e));

        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => rs(body));
      })
      .on('error', (e) => rj(e));
  });
}

function getURL(
  link: string | undefined | null,
  base = 'https://google.com/maps',
): string | null {
  try {
    if (link) {
      return new URL(link, base).searchParams.get('q');
    }
  } catch (e) {}

  return null;
}

function safeGet<T>(obj: any, ...keys: (string | number)[]): T | null {
  return keys.reduce((r, k) => {
    if (r !== null && typeof r === 'object' && k in r) return r[k];
    return null;
  }, obj);
}

export async function POST(req: Request) {
  const data = await req.json();
  if (!data.url)
    return NextResponse.json(
      { error: true, message: 'no url' },
      { status: 400 },
    );

  const body = await download(data.url);
  const match = body.match(
    /window\.APP_OPTIONS=(.*?);window.APP_INITIALIZATION_STATE=(.*?);window.APP_FLAGS=/ms,
  );
  if (!match)
    return NextResponse.json(
      { error: true, message: 'Couldnt get info from maps' },
      { status: 500 },
    );

  // const options = JSON.parse(match[1]);
  const state = JSON.parse(match[2]);
  const info = JSON.parse(state[3][6].substring(")]}'\n".length));

  const coords = safeGet<number[]>(info, 4, 0) || []; // unknown, longitude, latitude
  const address = safeGet(info, 6, 2);
  const opinions = safeGet<string[]>(info, 6, 4) || [];
  const web = getURL(safeGet(info, 6, 7, 0));
  const name = safeGet(info, 6, 11);
  // const categories = info[6][13]; // Localized name
  const cats = safeGet(info, 6, 76);
  const categories = (Array.isArray(cats) ? cats : [])
    .map((c: [string]) => c[0])
    .filter(Boolean);
  const menu = getURL(safeGet(info, 6, 38, 0));
  const links = safeGet(info, 6, 75);
  const tel = safeGet(info, 6, 178, 0);
  let order = safeGet(links, 0, 1, 2, 0, 1, 2, 0);
  let table = safeGet(links, 0, 0, 2, 0, 1, 2, 0);

  if (!order) {
    order = table;
    table = undefined;
  }

  // TODO: description

  return NextResponse.json({
    // info,
    coords: {
      lon: coords[1],
      lat: coords[2],
    },
    address,
    opinions: {
      price: opinions[2],
      score: opinions[7],
      amount: opinions[8],
    },
    links: {
      menu,
      web,
      table,
      order,
      tel: safeGet(tel, 1, 1, 0),
    },
    name,
    categories,
  });
}
