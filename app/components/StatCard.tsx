interface Props {
  label: string
  value: number | string
  color: 'red' | 'blue' | 'amber' | 'green'
  sub?: string
}

const c = {
  red:   'text-red-500',
  blue:  'text-blue-500',
  amber: 'text-amber-500',
  green: 'text-green-500',
}

export default function StatCard({ label, value, color, sub }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold font-mono ${c[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
