'use client'
import { useEffect, useState, useCallback } from 'react'
import { ThreatLog } from '@/types'
import StatCard from './components/StatCard'
import ThreatTable from './components/ThreatTable'
import AttackChart from './components/AttackChart'
import LiveLog from './components/LiveLog'

export default function Dashboard() {
  const [data,setData]=useState<ThreatLog[]>([])
  const [loading,setLoading]=useState(true)
  const [last,setLast]=useState(new Date())

  const fetchData=useCallback(async()=>{
    try {
      const json=await fetch('/api/threats').then(r=>r.json())
      setData(Array.isArray(json)?json:[])
      setLast(new Date())
    } catch(e){console.error(e)}
    finally{setLoading(false)}
  },[])

  useEffect(()=>{
    fetchData()
    const t=setInterval(fetchData,10000)
    return()=>clearInterval(t)
  },[fetchData])

  const blocked=data.filter(d=>d.score>=100).length
  const watching=data.filter(d=>d.score>=50&&d.score<100).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">🛡️</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Coba Coba — Security Dashboard</p>
              <p className="text-xs text-gray-400">Active Defense System · v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>Sistem Aktif
            </div>
            <p className="text-xs text-gray-400 font-mono">Update: {last.toLocaleTimeString('id-ID')}</p>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="IP Diblokir"     value={blocked}     color="red"   sub="skor ≥ 100"/>
              <StatCard label="Total Tercatat"   value={data.length} color="blue"  sub="semua entri"/>
              <StatCard label="Dalam Pemantauan" value={watching}    color="amber" sub="skor 50–99"/>
              <StatCard label="Refresh Otomatis" value="10s"         color="green" sub="interval saat ini"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AttackChart data={data}/>
              <LiveLog data={data}/>
            </div>
            <ThreatTable data={data}/>
          </>
        )}
      </main>
    </div>
  )
}
