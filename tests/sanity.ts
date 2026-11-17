import { computeEffects, resolveAtmo, ringRadius, probePoint } from "@/lib/model/effects";
import { estimateHarm } from "@/lib/model/harm";
import { cities } from "@/data/cities";
import type { Detonation, Environment, Thresholds, Population } from "@/lib/model/types";
const env: Environment = { windMode: "manual", windMs: 6.7, windFrom: 270, atmoMode: "manual", visibilityKm: 24, rh: 60, cloud: 0.2, rain: false, pressureHpa: 1013.25 };
const thr: Thresholds = { psi: [20,10,5,2,1], thermal: {burn3:true,burn2:true,burn1:true,ignite:true}, promptGy:[10,4.5,1], falloutMode:"rate", falloutRate:[3000,1000,300,100,10], falloutDose:[1000,300,100,10], windowH:[0,168] };
const pop: Population = { mix:{outdoor:0.15,ordinary:0.8,substantial:0.05}, model:"disc", scale:1, rural:15, firestorm:false, care:"normale" };
const atmo = resolveAtmo(env, null);
function det(o: Partial<Detonation>): Detonation { return { id:"a", lat:34.395, lon:132.455, place:"", weaponId:"x", yieldKt:15, fission:1, burst:"air", hobM:580, burialM:0, waterDepthM:30, delayS:0, ...o }; }
const km = (m:number)=> (m/1000).toFixed(2)+" km";
for (const [name,d] of [["Hiroshima 15kt @580",det({})],["1Mt opt",det({yieldKt:1000,burst:"air-opt"})],["1Mt surface",det({yieldKt:1000,burst:"surface"})],["Sedan",det({yieldKt:104,burst:"subsurface",burialM:194})],["Starfish 1.4Mt 400km",det({yieldKt:1400,burst:"high",hobM:400000})]] as const) {
  const t0=performance.now(); const e = computeEffects(d, atmo, thr); const t1=performance.now();
  console.log(`\n== ${name} (${(t1-t0).toFixed(0)} ms) hob ${e.hobM.toFixed(0)} fb ${km(e.fireballM)} crater ${km(e.craterRadiusM)}`);
  console.log(e.rings.map(r=>`${r.short}:${km(r.radiusM)}`).join("  "));
  console.log("fallout", e.fallout.map(f=>`${f.level}:${f.polygon.length}`).join(" "), "reach", e.falloutReachKm.toFixed(0), "km; cloud top", (e.cloud.topM/1000).toFixed(1), "mb", e.mb?.toFixed(1), "arr5psi", e.arrivalAt(ringRadius(e,"psi-5")).toFixed(1),"s");
  const p = probePoint(e, d.lat, d.lon+0.02, 0, 168); console.log("probe 0.02° E:", JSON.stringify({g:p.groundM.toFixed(0),psi:p.psi.toFixed(2),wind:p.windMs.toFixed(0),q:p.fluence.toFixed(1),gy:p.promptGy.toFixed(2),arr:p.arrivalS.toFixed(1),fall:p.fallout.dose.toFixed(1)}));
}
const e = computeEffects(det({}), atmo, thr);
const h = estimateHarm([e], cities, pop, [0,168]); console.log("\nHiroshima today harm", Math.round(h.deaths), Math.round(h.injuries), "ms", h.ms.toFixed(0), h.cities.slice(0,3).map(c=>c.name));
const e2 = computeEffects(det({yieldKt:1000,burst:"surface", lat:40.71, lon:-74.0}), atmo, thr);
const h2 = estimateHarm([e2], cities, pop, [0,168]); console.log("NYC 1Mt surface", Math.round(h2.deaths), "fallout", Math.round(h2.falloutDeaths), "ms", h2.ms.toFixed(0), h2.cities.slice(0,4).map(c=>c.name+":"+Math.round(c.deaths)));
