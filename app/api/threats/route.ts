import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Mapping range ke jumlah jam ke belakang
const RANGE_HOURS: Record<string, number> = {
  '1h':   1,
  '4h':   4,
  '12h':  12,
  '24h':  24,
  '1w':   24 * 7,
  '1m':   24 * 30,
  '3m':   24 * 90,
  '6m':   24 * 180,
  '1y':   24 * 365,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') ?? '24h'
  const hours = RANGE_HOURS[range] ?? 24

  // Hitung waktu mulai dalam UTC (Supabase menyimpan dalam UTC)
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('log_layer7')
    .select('*')
    .gte('detected_at', since)
    .order('detected_at', { ascending: false })
    .limit(5000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
