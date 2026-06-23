'use client'
import { ThreatLog } from '@/types'
import { useMemo } from 'react'
export default function AttackChart({ data }: { data: ThreatLog[] }) {
  const chart = useMemo(() => {
    const hours = Array.from({length:24},(_,i)=>{
      const d=new Date(); d.setHours(d.getHours()-(23-i),0,0,0)
      return {hour:d.getHours(),label:String(d.getHours()).padStart(2,'0'),count:0}
    })
    data.forEach(row=>{
      const s=hours.find(h=>h.hour===new Date(row.blocked_at).getHours())
      if(s) s.count++
    })
    return hours
  },[data])
  const max=Math.max(...chart.map(d=>d.count),1)
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-600 mb-4">Serangan per Jam (24 Jam Terakhir)</h2>
      <div className="flex items-end gap-1 h-28">
        {chart.map((d,i)=>(
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div
              className={`w-full rounded-sm transition-all duration-700 ${d.count===max&&max>0?'bg-red-400':'bg-blue-300'}`}
              style={{height:`${(d.count/max)*100}%`,minHeight:d.count>0?'4px':'2px'}}
              title={`${d.label}:00 — ${d.count} serangan`}/>
            <span className="text-gray-300 font-mono" style={{fontSize:'8px'}}>{i%6===0?d.label:''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
