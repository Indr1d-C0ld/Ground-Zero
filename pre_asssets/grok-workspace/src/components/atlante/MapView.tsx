import { useEffect, useRef } from "react";
import type { Effects } from "@/lib/effects/physics";
import { formatKm } from "@/lib/format";

export const MAP_STYLES = [
  {
    id: "buio",
    label: "Buio",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, HERE, Garmin, FAO, NOAA, USGS",
    sub: "",
    maxNative: 16,
  },
  {
    id: "chiaro",
    label: "Chiaro",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, HERE, Garmin, FAO, NOAA, USGS",
    sub: "",
    maxNative: 16,
  },
  {
    id: "atlas",
    label: "Atlante",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, National Geographic",
    sub: "",
    maxNative: 16,
  },
  {
    id: "strade",
    label: "Strade",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, HERE, Garmin, USGS, OSM",
    sub: "",
    maxNative: 19,
  },
  {
    id: "terreno",
    label: "Terreno",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, USGS, NOAA",
    sub: "",
    maxNative: 13,
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, Maxar, Earthstar Geographics",
    sub: "",
    maxNative: 19,
  },
  {
    id: "rilievo",
    label: "Rilievo",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, HERE, Garmin, FAO, NOAA, USGS",
    sub: "",
    maxNative: 19,
  },
] as const;

export type MapStyleId = (typeof MAP_STYLES)[number]["id"];

export type Layers = {
  fireball: boolean;
  blast: boolean;
  thermal: boolean;
  radiation: boolean;
  fallout: boolean;
  crater: boolean;
};

type Props = {
  lat: number;
  lon: number;
  styleId: MapStyleId;
  effects: Effects;
  compare: Effects | null;
  layers: Layers;
  onPick: (lat: number, lon: number) => void;
  fitToken: number;
  layoutKey: string;
};

type Snapshot = Omit<Props, "onPick" | "layoutKey">;

export function MapView(props: Props) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const snap = useRef<Snapshot>(props);
  snap.current = props;
  const pickRef = useRef(props.onPick);
  pickRef.current = props.onPick;
  const api = useRef<{
    draw: () => void;
    fit: () => void;
    resize: () => void;
    zoom: (delta: number) => void;
  } | null>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    let dead = false;
    let map: import("leaflet").Map | null = null;
    void (async () => {
      const L = await import("leaflet");
      if (dead || !nodeRef.current) return;
      const first = snap.current;
      map = L.map(nodeRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 2,
        worldCopyJump: false,
      }).setView([first.lat, first.lon], 12);
      map.createPane("labels");
      const labelPane = map.getPane("labels");
      if (labelPane) {
        labelPane.style.zIndex = "350";
        labelPane.style.pointerEvents = "none";
      }
      const group = L.layerGroup().addTo(map);
      let tiles: import("leaflet").TileLayer | null = null;
      let labelTiles: import("leaflet").TileLayer | null = null;
      let styleSeen = "";
      const marker = L.marker([first.lat, first.lon], {
        draggable: true,
        zIndexOffset: 1000,
        icon: L.divIcon({ className: "gz-mark", iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        pickRef.current(p.lat, p.lng);
      });
      map.on("click", (event) => {
        pickRef.current(event.latlng.lat, event.latlng.lng);
      });

      const ensureTiles = () => {
        const style = MAP_STYLES.find((s) => s.id === snap.current.styleId) ?? MAP_STYLES[0];
        if (styleSeen === style.id) return;
        styleSeen = style.id;
        tiles?.remove();
        labelTiles?.remove();
        labelTiles = null;
        tiles = L.tileLayer(style.url, {
          attribution: style.attr,
          subdomains: style.sub || "abc",
          maxZoom: 19,
          maxNativeZoom: "maxNative" in style ? style.maxNative : 19,
        }).addTo(map!);
        const labels = "labels" in style ? style.labels : "";
        if (labels) {
          labelTiles = L.tileLayer(labels, { pane: "labels", maxZoom: 19, maxNativeZoom: "maxNative" in style ? style.maxNative : 19 }).addTo(map!);
        }
      };

      const draw = () => {
        if (!map) return;
        ensureTiles();
        const s = snap.current;
        marker.setLatLng([s.lat, s.lon]);
        group.clearLayers();
        if (s.layers.fallout) {
          for (const contour of s.effects.fallout) {
            const alpha = contour.doseRad >= 1000 ? 0.28 : contour.doseRad >= 100 ? 0.18 : 0.1;
            L.polygon(contour.polygon, {
              color: "#9aab96",
              weight: 1,
              fillColor: "#9aab96",
              fillOpacity: alpha,
            })
              .bindTooltip(`${contour.label} all'aperto, stima`, { sticky: true })
              .addTo(group);
          }
        }
        const visible = s.effects.rings.filter((ring) => {
          if (ring.radiusM <= 0) return false;
          if (ring.group === "fireball") return s.layers.fireball;
          if (ring.group === "blast") return s.layers.blast;
          if (ring.group === "thermal") return s.layers.thermal && (ring.id === "burn3" || ring.id === "ignite");
          if (ring.group === "radiation") return s.layers.radiation;
          if (ring.group === "crater" || ring.group === "surge") return s.layers.crater;
          return false;
        });
        for (const ring of [...visible].sort((a, b) => b.radiusM - a.radiusM)) {
          L.circle([s.lat, s.lon], {
            radius: ring.radiusM,
            color: ring.stroke,
            weight: ring.id === "fireball" ? 1.6 : 1.25,
            fillColor: ring.stroke,
            fillOpacity: ring.group === "fireball" ? 0.45 : 0.12,
          })
            .bindTooltip(`${ring.label} · ${formatKm(ring.radiusM)}`, { sticky: true })
            .addTo(group);
        }
        if (s.compare) {
          for (const id of ["psi-5", "burn3"]) {
            const ring = s.compare.rings.find((r) => r.id === id);
            if (!ring || ring.radiusM <= 0) continue;
            L.circle([s.lat, s.lon], {
              radius: ring.radiusM,
              color: "#efe6dc",
              weight: 1.2,
              dashArray: "7 8",
              fillOpacity: 0,
            })
              .bindTooltip(`Confronto ${ring.label} · ${formatKm(ring.radiusM)}`, { sticky: true })
              .addTo(group);
          }
        }
      };

      const fit = () => {
        if (!map) return;
        const s = snap.current;
        const maxR = Math.max(...s.effects.rings.map((r) => r.radiusM), s.effects.falloutMaxKm * 1000, 800);
        map.fitBounds(L.latLng(s.lat, s.lon).toBounds(maxR * 2.4), {
          padding: [24, 24],
          maxZoom: 14,
          animate: false,
        });
      };

      api.current = {
        draw,
        fit,
        resize: () => map?.invalidateSize(),
        zoom: (delta) => {
          if (!map) return;
          map.setZoom(map.getZoom() + delta);
        },
      };
      draw();
      fit();
    })();
    return () => {
      dead = true;
      api.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    api.current?.draw();
  }, [props.lat, props.lon, props.styleId, props.effects, props.compare, props.layers]);

  useEffect(() => {
    api.current?.fit();
  }, [props.fitToken]);

  useEffect(() => {
    const id = window.setTimeout(() => api.current?.resize(), 50);
    return () => window.clearTimeout(id);
  }, [props.layoutKey]);

  const style = MAP_STYLES.find((s) => s.id === props.styleId) ?? MAP_STYLES[0];

  return (
    <div className="relative h-full w-full">
      <div ref={nodeRef} className="h-full w-full" />
      <div className="absolute top-24 left-3 z-10 flex flex-col overflow-hidden rounded-md border border-line">
        <button type="button" aria-label="Avvicina" onClick={() => api.current?.zoom(1)} className="grid size-11 place-items-center bg-surface text-lg leading-none">
          +
        </button>
        <button type="button" aria-label="Allontana" onClick={() => api.current?.zoom(-1)} className="grid size-11 place-items-center border-t border-line bg-surface text-lg leading-none">
          −
        </button>
      </div>
      <p className="pointer-events-none absolute right-2 bottom-1 z-10 max-w-[70%] truncate rounded bg-bg/80 px-1.5 py-0.5 text-[10px] text-muted">{style.attr}</p>
    </div>
  );
}
