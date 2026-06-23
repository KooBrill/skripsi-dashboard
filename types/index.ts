export interface ThreatLog {
  id: number
  ip_address: string
  uri: string
  user_agent: string
  score_delta: number
  total_score: number
  is_tool: boolean
  detected_at: string
}

export interface BannedLog {
  id: number
  ip_address: string
  final_score: number
  banned_at: string
}
