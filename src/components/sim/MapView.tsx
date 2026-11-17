import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { destination } from "@/lib/physics/core";
import { cloudTopAt, fireballAt } from "@/lib/physics/core";
import { sigmaKm } from "@/lib/physics/fallout";
import type { Effects } from "@/lib/model/effects";
import type { Harm } from "@/lib/model/harm";
import { formatDist, formatRad, formatPressure } from "@/lib/format";
import { useStore, type MapStyleId } from "@/state/store";
import { nearestPlace } from "@/data/places";
import { useSim } from "@/hooks/useSimulation";

export const MAP_STYLES: { id: MapStyleId; label: string; url: string; labels?: string; attr: string; maxNative: number }[] = [
  {
    id: "buio",
    label: "Notte",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, HERE, Garmin, FAO, NOAA, USGS",
    maxNative: 16,
  },
  {
    id: "chiaro",
    label: "Carta",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, HERE, Garmin, FAO, NOAA, USGS",
    maxNative: 16,
  },
  { id: "strade", label: "Strade", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", attr: "© Esri, HERE, Garmin, USGS, OSM", maxNative: 19 },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, Maxar, Earthstar Geographics",
    maxNative: 19,
  },
  {
    id: "terreno",
    label: "Terreno",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri, USGS, NOAA",
    maxNative: 13,
  },
  { id: "rilievo", label: "Topografica", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", attr: "© Esri, HERE, Garmin, FAO, NOAA, USGS", maxNative: 19 },
  { id: "atlas", label: "National Geographic", url: "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}", attr: "© Esri, National Geographic", maxNative: 16 },
];

export const FALLOUT_COLORS = ["#4b5d1f", "#6f8424", "#98a83a", "#c3c865", "#e3df9c", "#f1efcc", "#f7f6e6"];

export function falloutColor(i: number, n: number) {
  const k = n <= 1 ? 0 : Math.round((i / (n - 1)) * (FALLOUT_COLORS.length - 1));
  return FALLOUT_COLORS[k];
}

function heatColor(t: number): [number, number, number] {
  // t in 0..1 — dark violet → crimson → amber → pale yellow
  const stops: [number, [number, number, number]][] = [
    [0, [40, 10, 60]],
    [0.35, [150, 20, 50]],
    [0.65, [230, 100, 40]],
    [1, [255, 236, 170]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [a, ca] = stops[i - 1];
      const [b, cb] = stops[i];
      const f = (t - a) / (b - a);
      return [0, 1, 2].map((j) => Math.round(ca[j] + (cb[j] - ca[j]) * f)) as [number, number, number];
    }
  }
  return stops[stops.length - 1][1];
}

function heatImage(h: Harm): string | null {
  const g = h.grid;
  if (!g) return null;
  const c = document.createElement("canvas");
  c.width = g.nx;
  c.height = g.ny;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(g.nx, g.ny);
  for (let iy = 0; iy < g.ny; iy++) {
    for (let ix = 0; ix < g.nx; ix++) {
      const v = g.deathDensity[iy * g.nx + ix];
      const o = ((g.ny - 1 - iy) * g.nx + ix) * 4;
      if (v < 1) continue;
      const t = Math.min(1, Math.log10(v) / 4.3); // 1 → 20 000 deaths/km²
      const [r, gg, b] = heatColor(t);
      img.data[o] = r;
      img.data[o + 1] = gg;
      img.data[o + 2] = b;
      img.data[o + 3] = Math.round(90 + 140 * t);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

type Api = { draw: () => void; drawTime: () => void; fit: () => void; resize: () => void; zoom: (d: number) => void; heat: () => void };

export function MapView() {
  const node = useRef<HTMLDivElement | null>(null);
  const sim = useSim();
  const simRef = useRef(sim);
  simRef.current = sim;
  const api = useRef<Api | null>(null);

  const styleId = useStore((s) => s.styleId);
  const layers = useStore((s) => s.layers);
  const mapMode = useStore((s) => s.mapMode);
  const probe = useStore((s) => s.probe);
  const activeId = useStore((s) => s.activeId);
  const timeS = useStore((s) => s.timeS);
  const fitToken = useStore((s) => s.fitToken);
  const units = useStore((s) => s.units);
  const thr = useStore((s) => s.thr);

  useEffect(() => {
    let dead = false;
    let map: Leaflet.Map | null = null;
    void (async () => {
      const L = await import("leaflet");
      if (dead || !node.current) return;
      const st0 = useStore.getState();
      const a0 = st0.dets.find((d) => d.id === st0.activeId) ?? st0.dets[0];
      const renderer = L.svg({ padding: 0.5 });
      map = L.map(node.current, { zoomControl: false, attributionControl: false, minZoom: 2, worldCopyJump: true, renderer }).setView([a0.lat, a0.lon], 12);
      map.createPane("labels").style.zIndex = "390";
      map.getPane("labels")!.style.pointerEvents = "none";
      map.createPane("heat").style.zIndex = "380";
      map.getPane("heat")!.style.pointerEvents = "none";
      map.createPane("timeline").style.zIndex = "420";
      map.getPane("timeline")!.style.pointerEvents = "none";
      const timeRenderer = L.svg({ pane: "timeline" });

      const effectsLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);
      const timeLayer = L.layerGroup().addTo(map);
      let heatLayer: Leaflet.ImageOverlay | null = null;
      let tiles: Leaflet.TileLayer | null = null;
      let labelTiles: Leaflet.TileLayer | null = null;
      let styleSeen = "";

      const ensureTiles = () => {
        const s = useStore.getState();
        const style = MAP_STYLES.find((x) => x.id === s.styleId) ?? MAP_STYLES[0];
        if (styleSeen === style.id) return;
        styleSeen = style.id;
        tiles?.remove();
        labelTiles?.remove();
        tiles = L.tileLayer(style.url, { maxZoom: 19, maxNativeZoom: style.maxNative, crossOrigin: true }).addTo(map!);
        labelTiles = style.labels ? L.tileLayer(style.labels, { pane: "labels", maxZoom: 19, maxNativeZoom: style.maxNative }).addTo(map!) : null;
      };

      map.on("zoomend", () => draw());
      map.on("click", (ev) => {
        const s = useStore.getState();
        const { lat, lng } = ev.latlng;
        const lon = ((((lng + 180) % 360) + 360) % 360) - 180;
        if (s.mapMode === "probe") s.set({ probe: { lat, lon } });
        else if (s.mapMode === "add") {
          s.addDet(lat, lon, nearestPlace(lat, lon) ?? "");
          s.set({ mapMode: "move" });
        } else s.patchDet(s.activeId, { lat, lon, place: nearestPlace(lat, lon) ?? "" });
      });

      const draw = () => {
        if (!map) return;
        ensureTiles();
        const s = useStore.getState();
        const { effects } = simRef.current;
        effectsLayer.clearLayers();
        markersLayer.clearLayers();
        const lay = s.layers;
        const ordered = [...effects].sort((a, b) => (a.det.id === s.activeId ? 1 : 0) - (b.det.id === s.activeId ? 1 : 0));
        for (const e of ordered) {
          const isActive = e.det.id === s.activeId;
          const dim = isActive ? 1 : 0.55;
          if (lay.fallout) {
            const n = e.fallout.length;
            e.fallout.forEach((c, i) => {
              const col = falloutColor(n - 1 - i, n);
              L.polygon(c.polygon, { color: col, weight: 1, opacity: 0.9 * dim, fillColor: col, fillOpacity: 0.2 * dim, smoothFactor: 0.6 })
                .bindTooltip(
                  c.mode === "rate"
                    ? `Fallout: ${formatRad(c.level, s.units, true)} a H+1 (all'aperto)`
                    : `Fallout: ${formatRad(c.level, s.units)} accumulati fra ${s.thr.windowH[0]} e ${s.thr.windowH[1]} h (all'aperto)`,
                  { sticky: true, className: "atl-tip" },
                )
                .addTo(effectsLayer);
            });
          }
          const rings = e.rings
            .filter((r) => {
              if (r.radiusM <= 0) return false;
              if (r.group === "fireball") return lay.fireball;
              if (r.group === "blast") return lay.blast;
              if (r.group === "thermal") return lay.thermal;
              if (r.group === "radiation") return lay.radiation;
              if (r.group === "crater" || r.group === "surge") return lay.crater;
              if (r.group === "emp") return lay.emp;
              return false;
            })
            .sort((a, b) => b.radiusM - a.radiusM);
          for (const r of rings) {
            const isThermal = r.group === "thermal";
            const isRad = r.group === "radiation";
            const fill = r.group === "fireball" ? 0.5 : r.group === "crater" ? 0.5 : r.group === "emp" ? 0.04 : isThermal ? 0.04 : 0.1;
            L.circle([e.det.lat, e.det.lon], {
              radius: r.radiusM,
              color: r.color,
              weight: r.group === "fireball" ? 1.5 : 1.3,
              opacity: 0.95 * dim,
              dashArray: isThermal ? "6 5" : isRad ? "2 4" : r.group === "emp" ? "10 8" : undefined,
              fillColor: r.color,
              fillOpacity: fill * dim,
            })
              .bindTooltip(`<b>${r.label}</b> · ${formatDist(r.radiusM, s.units)}`, { sticky: true, className: "atl-tip" })
              .addTo(effectsLayer);
            // metres per screen pixel at this latitude and zoom: hide labels of rings too small to read
            const mpp = (156_543.03 * Math.cos((e.det.lat * Math.PI) / 180)) / 2 ** map.getZoom();
            if (lay.labels && isActive && r.radiusM / mpp > 34) {
              // stagger labels of the same family around the circle so they never stack
              const k = rings.filter((x) => x.group === r.group && x.radiusM / mpp > 34).findIndex((x) => x.id === r.id);
              const base = r.group === "blast" ? 62 : r.group === "thermal" ? 148 : r.group === "radiation" ? 236 : r.group === "emp" ? 0 : 320;
              const bearing = (base + Math.max(0, k) * 17) % 360;
              const p = destination(e.det.lat, e.det.lon, bearing, r.radiusM);
              const marker = L.circleMarker(p, { radius: 0, opacity: 0, fillOpacity: 0, interactive: false }).addTo(effectsLayer);
              marker.bindTooltip(r.group === "blast" ? r.short : r.short.replace("Ustioni di ", "").replace("Radiazione pronta ", ""), {
                permanent: true,
                direction: bearing > 180 ? "left" : "right",
                className: "atl-label",
                offset: [bearing > 180 ? -4 : 4, 0],
              });
            }
          }
        }
        effects.forEach((e, i) => {
          const isActive = e.det.id === s.activeId;
          const m = L.marker([e.det.lat, e.det.lon], {
            draggable: true,
            zIndexOffset: isActive ? 1000 : 500,
            icon: L.divIcon({
              className: `gz-mark ${isActive ? "" : "inactive"}`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              html: effects.length > 1 ? `<span class="gz-n">${i + 1}</span>` : "",
            }),
          }).addTo(markersLayer);
          m.on("click", () => useStore.getState().set({ activeId: e.det.id }));
          m.on("dragend", () => {
            const p = m.getLatLng();
            useStore.getState().patchDet(e.det.id, { lat: p.lat, lon: p.lng, place: nearestPlace(p.lat, p.lng) ?? "" });
            useStore.getState().set({ activeId: e.det.id });
          });
        });
        if (s.probe) {
          const pm = L.marker([s.probe.lat, s.probe.lon], {
            draggable: true,
            zIndexOffset: 2000,
            icon: L.divIcon({ className: "probe-mark", iconSize: [12, 12], iconAnchor: [6, 6] }),
          }).addTo(markersLayer);
          pm.on("dragend", () => {
            const p = pm.getLatLng();
            useStore.getState().set({ probe: { lat: p.lat, lon: p.lng } });
          });
          const act = effects.find((x) => x.det.id === s.activeId) ?? effects[0];
          L.polyline(
            [
              [act.det.lat, act.det.lon],
              [s.probe.lat, s.probe.lon],
            ],
            { color: "#ffffff", weight: 1, opacity: 0.6, dashArray: "3 5", interactive: false },
          ).addTo(markersLayer);
        }
        const cont = map.getContainer();
        cont.classList.toggle("mode-add", s.mapMode === "add");
        cont.classList.toggle("mode-probe", s.mapMode === "probe");
      };

      const heat = () => {
        if (!map) return;
        heatLayer?.remove();
        heatLayer = null;
        const s = useStore.getState();
        const h = simRef.current.harm;
        if (!s.layers.heat || !h?.grid) return;
        const url = heatImage(h);
        if (!url) return;
        heatLayer = L.imageOverlay(
          url,
          [
            [h.grid.south, h.grid.west],
            [h.grid.north, h.grid.east],
          ],
          { pane: "heat", opacity: 0.85, className: "heat-img" },
        ).addTo(map);
        const el = heatLayer.getElement();
        if (el) el.style.imageRendering = "pixelated";
      };

      const drawTime = () => {
        if (!map) return;
        timeLayer.clearLayers();
        const s = useStore.getState();
        const t = s.timeS;
        if (t == null) return;
        for (const e of simRef.current.effects) {
          const tl = t - e.det.delayS;
          if (tl <= 0) continue;
          const surface = e.hobM < e.fireballM;
          const fb = fireballAt(e.yieldKt, surface, tl);
          if (fb > 0 && tl < 12 * e.tmaxS + 3 && e.rings[0].radiusM > 0) {
            L.circle([e.det.lat, e.det.lon], { radius: fb, renderer: timeRenderer, color: "#fff7e0", weight: 1, fillColor: "#fff2c4", fillOpacity: Math.max(0.15, 0.9 - tl / (12 * e.tmaxS + 3)) }).addTo(timeLayer);
          }
          const rs = e.shockRadiusAt(tl);
          if (rs > 5 && e.psiAt(rs) > 0.3) {
            L.circle([e.det.lat, e.det.lon], { radius: rs, renderer: timeRenderer, color: "#ffffff", weight: 2.4, opacity: 0.95, fill: false })
              .bindTooltip(`Fronte d'urto · ${formatDist(rs, s.units)} · ${formatPressure(e.psiAt(rs), s.units)}`, { permanent: true, direction: "top", className: "atl-label" })
              .addTo(timeLayer);
          }
          if (e.plume.active) {
            const th = tl / 3600;
            if (th > 0.25) {
              const xKm = (th - 0.25) * e.plume.windMs * 3.6;
              const half = 2.5 * sigmaKm(e.plume, xKm);
              const c = destination(e.det.lat, e.det.lon, e.plume.downwindDeg, xKm * 1000);
              const a = destination(c[0], c[1], e.plume.downwindDeg + 90, half * 1000);
              const b = destination(c[0], c[1], e.plume.downwindDeg - 90, half * 1000);
              L.polyline([a, c, b], { renderer: timeRenderer, color: "#e8f07a", weight: 2.5, dashArray: "6 4" })
                .bindTooltip(`Arrivo del fallout · ${formatDist(xKm * 1000, s.units)}`, { permanent: true, direction: "right", className: "atl-label" })
                .addTo(timeLayer);
            }
          }
          void cloudTopAt;
        }
      };

      const fit = () => {
        if (!map) return;
        const s = useStore.getState();
        const { effects } = simRef.current;
        let bounds: Leaflet.LatLngBounds | null = null;
        for (const e of effects) {
          const r = Math.max(
            ...e.rings.filter((x) => x.group !== "emp" || s.layers.emp).map((x) => x.radiusM),
            800,
          );
          const b = L.latLng(e.det.lat, e.det.lon).toBounds(r * 2.3);
          bounds = bounds ? bounds.extend(b) : b;
          if (s.layers.fallout && e.fallout.length) {
            const outer = e.fallout[e.fallout.length - 1].polygon;
            const fb = L.latLngBounds(outer.map((p) => L.latLng(p[0], p[1])));
            // keep the immediate effects legible: include at most ~3x the blast extent of plume
            if (fb.isValid() && e.falloutReachKm * 1000 < r * 12) bounds = bounds.extend(fb);
          }
        }
        if (bounds) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15, animate: true, duration: 0.6 });
      };

      api.current = {
        draw,
        drawTime,
        fit,
        heat,
        resize: () => map?.invalidateSize(),
        zoom: (d) => map?.setZoom(map.getZoom() + d),
      };
      draw();
      fit();
      heat();
    })();
    return () => {
      dead = true;
      api.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    api.current?.draw();
  }, [sim.effects, styleId, layers, mapMode, probe, activeId, units, thr]);
  useEffect(() => {
    api.current?.heat();
  }, [sim.harm, layers.heat]);
  useEffect(() => {
    api.current?.drawTime();
  }, [timeS, sim.effects, units]);
  useEffect(() => {
    api.current?.fit();
  }, [fitToken]);
  useEffect(() => {
    const el = node.current;
    if (!el) return;
    const ro = new ResizeObserver(() => api.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return <div ref={node} className="absolute inset-0" />;
}

export type { Effects };
