'use client';

import { useState, useMemo, useEffect } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  AttributionControl,
  ZoomControl,
  useMap,
  CircleMarker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from 'leaflet/dist/images/marker-icon.png';
import IconShadow from 'leaflet/dist/images/marker-shadow.png';

import Link from 'next/link';
import { List } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { getTags } from '@/lib/places';
import type { Place } from '@/interfaces/place';

import { TagFilter } from '../tag-filter';
import { TagBadge } from '../tag-badge';
import { IconLink } from '../place-card';

export interface MapProps {
  listId: string;
  filters: string[];
  places: Place[];
}

function fromPointStringToLatLng(point: string): [number, number] {
  const match = point
    .trim()
    .match(/\(\s*(-?\d+(\.\d+)?)\s*,(-?\d+(\.\d+)?)\s*\)/);
  if (match) return [parseFloat(match[3]), parseFloat(match[1])];

  return [0, 0];
}

const MarkerIcon = L.icon({
  iconUrl: Icon.src,
  shadowUrl: IconShadow.src,
});

function LocationMarker() {
  const [position, setPosition] = useState();
  const map = useMap();
  useEffect(() => {
    const handler = (e: any) => {
      setPosition(e.latlng);
    };
    map.on('locationfound', handler);
    map.locate({
      watch: true,
    });
    return () => {
      map.stopLocate();
      map.off('locationfound', handler);
    };
  }, []);

  if (!position) return null;

  return <CircleMarker center={position} radius={8} />;
}

export function Map({ listId, filters, places }: MapProps) {
  const url = `/app/list/${listId}`;
  const urlMap = `${url}/map`;
  const placesWithLocation = useMemo(
    () =>
      places
        .filter((p) => p.location)
        .map((place) => ({
          ...place,
          location: fromPointStringToLatLng(place.location as string),
        })),
    [places],
  );
  const [initialCenter] = useState(() => {
    return placesWithLocation
      .reduce(
        (point, place) => {
          point[0] += place.location[0];
          point[1] += place.location[1];
          return point;
        },
        [0, 0],
      )
      .map((v) => v / placesWithLocation.length) as [number, number];
  });
  const markers = useMemo(
    () =>
      placesWithLocation.map((place) => (
        <Marker key={place.id} position={place.location} icon={MarkerIcon}>
          <Popup>
            <p className="font-bold">{place.title}</p>
            <p>{place.description}</p>
            <div>
              {place.urls.map((url, index) => (
                <IconLink key={`${url}-${index}`} href={url} />
              ))}
            </div>
          </Popup>
        </Marker>
      )),
    [placesWithLocation],
  );
  const tags = useMemo(() => getTags(placesWithLocation), [placesWithLocation]);

  return (
    <>
      <MapContainer
        center={initialCenter}
        zoom={13}
        className="h-screen w-screen"
        attributionControl={false}
        zoomControl={false}
      >
        <AttributionControl prefix="" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <LocationMarker />
        {markers}
      </MapContainer>
      <div className="flex absolute top-2 left-2 z-[400] space-x-1 items-center">
        <Link
          className={buttonVariants({ variant: 'outline', size: 'icon' })}
          href={url}
        >
          <List className="h-4 w-4" />
        </Link>
        <TagFilter
          tags={tags}
          url={urlMap}
          filters={filters}
          {...({
            className: 'h-auto',
            wrapperClassName: 'h-10 border-input bg-background',
          } as any)}
        />
        {filters.map((filter, index) => (
          <TagBadge
            url={urlMap}
            key={`${filter}-${index}`}
            className="h-10 rounded-lg border-input bg-background"
            variant="outline"
            value={filter}
            filters={filters}
          >
            {filter}
          </TagBadge>
        ))}
      </div>
    </>
  );
}
