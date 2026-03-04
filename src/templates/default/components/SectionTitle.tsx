export default function SectionTitle({
  title,
  accent,
  center,
}: {
  title: string;
  accent: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-3xl font-bold text-white">{title}</h2>
      <div
        className="h-1 w-12 rounded-full mt-3"
        style={{
          background: accent,
          marginLeft: center ? "auto" : undefined,
          marginRight: center ? "auto" : undefined,
        }}
      />
    </div>
  );
}