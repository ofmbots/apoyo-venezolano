"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { TIPO_CENTRO_COLOR, TIPO_CENTRO_LABEL, type Centro } from "@/lib/types";

function pinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 9.8 14 26 14 26s14-16.2 14-26C28 6.3 21.7 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="5.5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

export default function MapaCentros({ centros }: { centros: Centro[] }) {
  return (
    <MapContainer
      center={[8.4, -66.0]}
      zoom={6}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {centros.map((c) => (
        <Marker
          key={c.id}
          position={[c.lat, c.lng]}
          icon={pinIcon(TIPO_CENTRO_COLOR[c.tipo])}
        >
          <Popup minWidth={240} maxWidth={300}>
            <div style={{ padding: "16px 18px 14px", fontFamily: "system-ui, sans-serif" }}>

              {/* Tipo badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <span style={{
                  width: "10px", height: "10px", borderRadius: "50%",
                  backgroundColor: TIPO_CENTRO_COLOR[c.tipo], flexShrink: 0,
                }} />
                <span style={{
                  fontSize: "11px", textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "#64748b", fontWeight: 600,
                }}>
                  {TIPO_CENTRO_LABEL[c.tipo]}
                </span>
              </div>

              {/* Nombre */}
              <p style={{
                fontSize: "15px", fontWeight: 700, color: "#0f172a",
                margin: "0 0 8px 0", lineHeight: 1.3,
              }}>
                {c.nombre}
              </p>

              {/* Dirección */}
              {c.direccion && (
                <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 4px 0" }}>
                  📍 {c.direccion}
                </p>
              )}

              {/* Teléfono */}
              {c.telefono_contacto && (
                <a
                  href={`tel:${c.telefono_contacto}`}
                  style={{ display: "block", fontSize: "12px", color: "#2563eb", margin: "0 0 4px 0", textDecoration: "none" }}
                >
                  📞 {c.telefono_contacto}
                </a>
              )}

              {/* Fecha hasta (temporales) */}
              {c.tipo === "temporal" && c.fecha_hasta && (
                <p style={{ fontSize: "11px", color: "#d97706", margin: "4px 0 0 0" }}>
                  ⏱ Hasta{" "}
                  {new Date(c.fecha_hasta).toLocaleString("es-VE", {
                    dateStyle: "short", timeStyle: "short", timeZone: "America/Caracas",
                  })}
                </p>
              )}

              {/* Divisor */}
              <div style={{ borderTop: "1px solid #f1f5f9", margin: "12px 0 10px" }} />

              {/* Acciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Link
                  href={`/centros/${c.id}`}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "9px 14px", background: "#fbbf24",
                    color: "#0f172a", fontSize: "13px", fontWeight: 700,
                    borderRadius: "9px", textDecoration: "none",
                  }}
                >
                  Ver detalle
                </Link>
                <Link
                  href={`/centros/${c.id}#eliminar`}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "7px 14px", background: "transparent",
                    border: "1px solid #e2e8f0", color: "#94a3b8",
                    fontSize: "12px", borderRadius: "9px", textDecoration: "none",
                  }}
                >
                  Solicitar eliminación
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
