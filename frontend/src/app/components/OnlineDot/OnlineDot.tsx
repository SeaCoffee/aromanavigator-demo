export function OnlineDot({ online }: { online?: boolean }) {
  return <span className={`inline-block h-2 w-2 rounded-full align-middle ${online ? 'bg-green-500' : 'bg-gray-400'}`} />;
}
