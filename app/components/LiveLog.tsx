'use client'
import { ThreatLog } from '@/types'
import { useEffect, useRef } from 'react'
export default function LiveLog({ data }: { data: ThreatLog[] }) {
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[data])
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-600">Log Aktivitas</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-500 border border-green-200">Live</span>
      </div>
      <div ref={ref} className="h-48 overflow-y-auto p-3 space-y-1">
        {data.slice(0,50).map(row=>(
          <div key={row.id} className="flex gap-3 text-xs font-mono py-1 border-b border-gray-50">
            <span className="text-gray-300 flex-shrink-0">{new Date(row.blocked_at).toLocaleTimeString('id-ID')}</span>
            <span className="text-blue-500 flex-shrink-0 w-28 truncate">{row.ip_address}</span>
            <span className="text-gray-500 flex-1">{row.score>=100?'Diblokir via UFW':`Skor: ${row.score}`}</span>
            <span className={row.score>=100?'text-red-400':'text-amber-400'}>{row.score>=100?'🔴':`+${row.score}`}</span>
          </div>
        ))}
        {data.length===0&&<p className="text-center text-gray-400 text-xs py-4">Belum ada aktivitas</p>}
      </div>
    </div>
  )
}
