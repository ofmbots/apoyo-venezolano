"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <path d="M14 0C6.3 0 0 6.3 0 14c0 9.8 14 26 14 26s14-16.2 14-26C28 6.3 21.7 0 14 0z" fill="#fbbf24"/>
  <circle cx="14" cy="14" r="5.5" fill="white"/>
</svg>`;

const icon = L.divIcon({
  html: PIN_SVG,
  className: "",
  iconSize: [28, 40],
  iconAnchor: [14, 40],
});

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onSelect(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapaSelectorPicker({
  lat,
  lng,
  onSelect,
}: {
  lat: number | null;
  lng: number | null;
  onSelect: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={[8.0, -66.0]}
      zoom={6}
      scrollWheelZoom
      className="mapa-selector h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
        keepBuffer={4}
      />
      <ClickHandler onSelect={onSelect} />
      {lat !== null && lng !== null && (
        <Marker position={[lat, lng]} icon={icon} />
      )}
    </MapContainer>
  );
}
