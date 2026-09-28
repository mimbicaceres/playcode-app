import React from 'react';

interface XpTrendChartProps {
  // XP obtained per week, oldest first; the last value is the current week.
  // Empty when there is no activity yet.
  weeklyXp: number[];
  emptyMessage: string;
  // X axis labels, one per value (days, weeks or months depending on the report period).
  labels?: string[];
}

const WEEK_LABELS = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana Actual'];
// With many points only the current one keeps its value label (the others show it on hover).
const MAX_LABELED_POINTS = 7;
const formatXp = (value: number) => value.toLocaleString('es-AR');

// Rounds the axis maximum up to a "nice" number (1, 2 or 5 × 10^n per step).
function niceStep(rawStep: number) {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rawStep, 1)));
  const normalized = rawStep / magnitude;
  return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
}

// Smooth curve through the points (Catmull-Rom converted to cubic Bézier).
function smoothPath(points: { x: number; y: number }[]) {
  return points.reduce((path, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const p0 = points[i - 2] ?? points[i - 1];
    const p1 = points[i - 1];
    const p2 = points[i + 1] ?? p;
    const c1 = { x: p1.x + (p.x - p0.x) / 6, y: p1.y + (p.y - p0.y) / 6 };
    const c2 = { x: p.x - (p2.x - p1.x) / 6, y: p.y - (p2.y - p1.y) / 6 };
    return `${path} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p.x},${p.y}`;
  }, '');
}

export const XpTrendChart: React.FC<XpTrendChartProps> = ({ weeklyXp, emptyMessage, labels = WEEK_LABELS }) => {
  const hasData = weeklyXp.length > 0;
  const step = niceStep(Math.max(...weeklyXp, 0) / 4);
  const axisMax = step * 4 || 1;
  const ticks = [4, 3, 2, 1, 0].map((i) => i * step);
  // Horizontal positions (in %) leave room at both ends for the labels.
  const xOf = (i: number) => 4 + (i * 92) / Math.max(1, labels.length - 1);
  const labelAll = weeklyXp.length <= MAX_LABELED_POINTS;
  const points = weeklyXp.map((value, i) => ({ x: xOf(i), y: 100 - (value / axisMax) * 100, value }));
  const linePath = smoothPath(points);
  const areaPath = points.length ? `${linePath} L${points[points.length - 1].x},100 L${points[0].x},100 Z` : '';

  return (
    <div className="flex gap-3">
      {/* Y axis */}
      <div className="relative h-[200px] mt-8 w-10 shrink-0 text-[10px] text-slate-400 font-mono">
        {(hasData ? ticks : [0]).map((tick) => (
          <span
            key={tick}
            className="absolute right-0 -translate-y-1/2 leading-none"
            style={{ top: `${100 - (tick / axisMax) * 100}%` }}
          >
            {formatXp(tick)}
          </span>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        {/* Plot area (with room above for the value labels) */}
        <div className="relative h-[200px] mt-8">
          {/* Horizontal grid lines */}
          {ticks.map((tick) => (
            <div
              key={tick}
              className={`absolute inset-x-0 border-t ${tick === 0 ? 'border-slate-200' : 'border-dashed border-slate-100'}`}
              style={{ top: `${100 - (tick / axisMax) * 100}%` }}
            />
          ))}

          {hasData ? (
            <>
              {/* Vertical guides at each week */}
              {points.map((p) => (
                <div key={`guide-${p.x}`} className="absolute top-0 bottom-0 border-l border-dashed border-slate-100" style={{ left: `${p.x}%` }} />
              ))}

              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="xpTrendArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#xpTrendArea)" />
                <path d={linePath} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>

              {/* Points and value labels (HTML, so they keep their shape at any width) */}
              {points.map((p, i) => {
                const isCurrent = i === points.length - 1;
                return (
                  <div key={`point-${p.x}`} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }} title={`+${formatXp(p.value)} XP`}>
                    {(labelAll || isCurrent) && (
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg font-bold ${
                        isCurrent
                          ? 'bottom-4 bg-emerald-600 text-white text-xs px-2.5 py-1 shadow-md'
                          : 'bottom-3 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5'
                      }`}
                    >
                      +{formatXp(p.value)} XP
                    </span>
                    )}
                    <span
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 ring-white ${
                        isCurrent ? 'w-4 h-4 ring-4 shadow-md' : 'w-3 h-3 ring-2'
                      }`}
                    />
                  </div>
                );
              })}
            </>
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-500">
              {emptyMessage}
            </p>
          )}
        </div>

        {/* X axis */}
        <div className="relative h-6 mt-2">
          {labels.map((label, i) => {
            const isCurrent = i === labels.length - 1;
            return (
              <span
                key={label}
                className={`absolute -translate-x-1/2 text-xs whitespace-nowrap ${isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
                style={{ left: `${xOf(i)}%` }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
