export default function CandidateCard({
  name,
  role,
  metaLeft,
  metaRight,
  score,
}: {
  name: string;
  role: string;
  metaLeft: string;
  metaRight: string;
  score: string;
}) {
  return (
    <div className="rounded-md bg-[#282036]">
      <div className="px-4 py-3">
        <div className="font-semibold leading-5 text-neutral-300">{name}</div>
        <div className="text-xs  text-neutral-400">{role}</div>
      </div>
      <div className="px-4 pb-3 text-xs text-neutral-400">
        <div className="flex items-center justify-between">
          <span>Score:</span>
          <span>{score}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{metaLeft}</span>
          <span>{metaRight}</span>
        </div>
      </div>
    </div>
  );
}
