import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'

/** Side of the square chart, in px. The placeholder ring in OverallConfidence has the same size. */
export const GAUGE_SIZE = 96

interface Props {
  /** 0 to 100. */
  percent: number
  /** A `text-*` token class. The arc uses `currentColor`, so its color stays a design token. */
  colorClass: string
}

// Kept in its own module so that Recharts, the heaviest dependency, is only fetched once a result
// exists (design FD7). Decorative: OverallConfidence puts the label and the readable number around it.
export default function ConfidenceGauge({ percent, colorClass }: Props) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className={colorClass} aria-hidden="true">
      <RadialBarChart
        width={GAUGE_SIZE}
        height={GAUGE_SIZE}
        data={[{ value: percent }]}
        innerRadius="76%"
        outerRadius="100%"
        startAngle={90}
        endAngle={-270}
        barSize={10}
        accessibilityLayer={false}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          fill="currentColor"
          background={{ className: 'fill-border' }}
          isAnimationActive={!reduceMotion}
          animationDuration={700}
        />
      </RadialBarChart>
    </div>
  )
}
