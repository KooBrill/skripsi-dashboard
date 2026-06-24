'use client'
import { ThreatLog } from '@/types'

export default function ThreatTable({ data }: { data: ThreatLog[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-600">Log Serangan</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-500 border border-amber-200 font-medium">
          {data.length} event
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['IP Address', 'URI', 'Skor Hit', 'Total', 'Tool', 'Waktu'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600 text-xs">{row.ip_address}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.uri}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-amber-500">+{row.score_delta}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{row.total_score}</td>
                <td className="px-4 py-3">
                  {row.is_tool
                    ? <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-500 border border-red-200">Ya</span>
                    : <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200">Tidak</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                  {new Date(row.detected_at).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Belum ada data serangan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
