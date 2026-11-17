import type { Silhouette as Form } from "@/data/weapons";

const ASPECT: Record<Form, number> = {
  thin: 4.2,
  egg: 2.1,
  bomb: 3.2,
  rv: 2.4,
  cruise: 6.5,
  shell: 3.4,
  torpedo: 7,
  device: 1.15,
  missile: 5.5,
};

/** Sagoma esterna di categoria. Non è un disegno costruttivo. */
export function Silhouette({ form, lengthM, diameterM }: { form: Form; lengthM?: number; diameterM?: number }) {
  const ratio = lengthM && diameterM && diameterM > 0 ? Math.min(8, Math.max(1.1, lengthM / diameterM)) : ASPECT[form];
  const w = 120;
  const h = 72;
  const bodyH = Math.min(h - 16, (w - 28) / ratio);
  const bodyW = bodyH * ratio;
  const x = (w - bodyW) / 2;
  const y = (h - bodyH) / 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" role="img" aria-label="Sagoma esterna schematica">
      <rect x="0" y="0" width={w} height={h} fill="transparent" />
      {form === "egg" && (
        <ellipse cx={w / 2} cy={h / 2} rx={bodyW / 2.3} ry={bodyH / 1.3} fill="none" stroke="currentColor" strokeWidth="1.4" />
      )}
      {form === "device" && (
        <circle cx={w / 2} cy={h / 2} r={Math.min(bodyH, 22)} fill="none" stroke="currentColor" strokeWidth="1.4" />
      )}
      {form === "rv" && (
        <path
          d={`M ${x + bodyW * 0.15} ${y + bodyH} L ${x + bodyW * 0.5} ${y} L ${x + bodyW * 0.85} ${y + bodyH} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      )}
      {(form === "thin" || form === "bomb" || form === "shell" || form === "torpedo" || form === "cruise" || form === "missile") && (
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x={x} y={y} width={bodyW * 0.82} height={bodyH} rx={bodyH / 2} />
          <path d={`M ${x + bodyW * 0.82} ${y} L ${x + bodyW} ${y + bodyH / 2} L ${x + bodyW * 0.82} ${y + bodyH}`} />
          {(form === "cruise" || form === "missile" || form === "bomb") && (
            <path d={`M ${x + bodyW * 0.25} ${y + bodyH} L ${x + bodyW * 0.4} ${y + bodyH + 6} L ${x + bodyW * 0.5} ${y + bodyH}`} />
          )}
        </g>
      )}
    </svg>
  );
}
