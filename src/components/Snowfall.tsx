// Pure CSS snow. Positions are derived from the index so server and client render the same thing.
const FLAKES = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    size: 10 + Math.round(r(2) * 12),
    duration: 9 + r(3) * 12,
    delay: -r(4) * 20,
    drift: `${Math.round((r(5) - 0.5) * 120)}px`,
    opacity: 0.45 + r(6) * 0.5,
  };
});

export default function Snowfall() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="snowflake"
          style={
            {
              left: f.left,
              fontSize: f.size,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              "--drift": f.drift,
            } as React.CSSProperties
          }
        >
          ❄
        </span>
      ))}
    </div>
  );
}
