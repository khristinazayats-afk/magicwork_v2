export default function PresenceBadge({ present }) {
  if (!present) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#172223]/5 border border-[#172223]/10">
      <div className="w-2 h-2 rounded-full bg-[#172223] animate-pulse" />
      <span className="font-hanken text-xs text-[#172223]/70">
        Present today
      </span>
    </div>
  );
}

