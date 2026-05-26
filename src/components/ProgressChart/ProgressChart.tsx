import type { ProgressPoint } from "@/lib/statistics";
import styles from "./ProgressChart.module.css";

type Props = {
  series: ProgressPoint[];
  unitLabel: string;
  emptyLabel: string;
};

const W = 320;
const H = 160;
const PAD = { top: 12, right: 12, bottom: 28, left: 40 };

export function ProgressChart({ series, unitLabel, emptyLabel }: Props) {
  if (series.length === 0) {
    return <p className={styles.empty}>{emptyLabel}</p>;
  }

  const values = series.map((p) => p.weightKg);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const points = series.map((p, i) => {
    const x =
      PAD.left +
      (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = PAD.top + innerH - ((p.weightKg - minV) / range) * innerH;
    return { x, y, ...p };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  const area =
    points.length > 0
      ? `M ${points[0].x} ${PAD.top + innerH} ${points.map((p) => `L ${p.x} ${p.y}`).join(" ")} L ${points[points.length - 1].x} ${PAD.top + innerH} Z`
      : "";

  const yTicks = [minV, minV + range / 2, maxV].map(
    (v) => Math.round(v * 10) / 10
  );
  const uniqueTicks = [...new Set(yTicks)];

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
        role="img"
        aria-label="Progress chart"
      >
        {uniqueTicks.map((tick) => {
          const y = PAD.top + innerH - ((tick - minV) / range) * innerH;
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                className={styles.gridLine}
              />
              <text x={PAD.left - 6} y={y + 4} className={styles.axisLabel}>
                {tick}
              </text>
            </g>
          );
        })}
        <path d={area} className={styles.area} />
        <polyline
          points={polyline}
          fill="none"
          className={styles.line}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r="4" className={styles.dot} />
        ))}
        {points.length <= 6 &&
          points.map((p) => (
            <text
              key={`l-${p.date}`}
              x={p.x}
              y={H - 6}
              textAnchor="middle"
              className={styles.dateLabel}
            >
              {p.date.slice(5)}
            </text>
          ))}
      </svg>
      <p className={styles.unit}>{unitLabel}</p>
    </div>
  );
}
