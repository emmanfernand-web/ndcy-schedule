export function Progress({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className="h-1 overflow-hidden rounded-full bg-line"
    >
      <div
        className="h-full rounded-full bg-gold-500 transition-[width] duration-500"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}
