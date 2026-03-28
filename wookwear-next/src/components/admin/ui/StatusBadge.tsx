const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  sold: "bg-red-500/10 text-red-400 border-red-500/20",
  new: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  oneofone: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  collection: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function StatusBadge({ status }: { status: string }) {
  const style =
    statusStyles[status.toLowerCase()] ||
    "bg-gray-500/10 text-gray-400 border-gray-500/20";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
}
