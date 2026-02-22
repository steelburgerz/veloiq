import 'server-only'
import fs from 'fs'
import path from 'path'

interface StravaConfig {
  access_token: string
  refresh_token: string
  expires_at: number
  client_id: string
  client_secret: string
}

function getConfig(): StravaConfig | null {
  const configPath = path.resolve(process.env.STRAVA_CONFIG ?? '/Users/ralphkoh/.config/strava/config.json')
  if (!fs.existsSync(configPath)) return null
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

async function refreshIfNeeded(cfg: StravaConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cfg.expires_at > now + 60) return cfg.access_token

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
      grant_type: 'refresh_token',
      refresh_token: cfg.refresh_token,
    }),
  })
  const data = await res.json()
  return data.access_token as string
}

export interface ActivityMap {
  summaryPolyline: string | null
  startLatlng: [number, number] | null
  endLatlng: [number, number] | null
  isVirtual: boolean
}

export async function getActivityMap(stravaId: string): Promise<ActivityMap | null> {
  const cfg = getConfig()
  if (!cfg) return null

  try {
    const token = await refreshIfNeeded(cfg)
    const res = await fetch(`https://www.strava.com/api/v3/activities/${stravaId}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 }, // cache 1hr
    })
    if (!res.ok) return null
    const data = await res.json()

    return {
      summaryPolyline: data.map?.summary_polyline ?? null,
      startLatlng: data.start_latlng ?? null,
      endLatlng: data.end_latlng ?? null,
      isVirtual: data.sport_type === 'VirtualRide' || data.trainer === true,
    }
  } catch {
    return null
  }
}
