'use client'
import { BannedLog } from '@/types'

export default function BannedTable({ data }: { data: BannedLog[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-600">IP Diblokir Permanen</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-500 border border-red-200 font-medium">
          {data.length} IP
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['IP Address', 'Skor Final', 'Waktu Diblokir'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-red-500 text-xs font-semibold">{row.ip_address}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-gray-100 w-16 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{ width: `${Math.min((row.final_score / 300) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-semibold text-red-500">{row.final_score}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                  {new Date(row.banned_at).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">Belum ada IP yang diblokir</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
