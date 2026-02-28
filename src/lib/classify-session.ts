import { Ride, SessionType, KeyBlock, ZonesSec } from '@/types'

/**
 * Auto-classify ride session type based on power zones and key blocks.
 * This provides a more accurate classification than the generic "mixed" from Intervals.
 */

interface ZoneTime {
  z1z2: number  // Recovery/Endurance
  z3: number    // Tempo
  z4: number    // Threshold
  z5z6z7: number // VO2max/Anaerobic
  total: number
}

function normalizeZones(zones: ZonesSec | null | undefined): ZoneTime {
  if (!zones) return { z1z2: 0, z3: 0, z4: 0, z5z6z7: 0, total: 0 }
  
  // Handle both object format {Z1: 100, Z2: 200} and array format [{id: "Z1", secs: 100}]
  let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0, z6 = 0, z7 = 0
  
  if (Array.isArray(zones)) {
    for (const z of zones) {
      const secs = (z as { secs?: number }).secs || 0
      const id = (z as { id?: string }).id || ''
      if (id === 'Z1') z1 = secs
      else if (id === 'Z2') z2 = secs
      else if (id === 'Z3') z3 = secs
      else if (id === 'Z4') z4 = secs
      else if (id === 'Z5') z5 = secs
      else if (id === 'Z6') z6 = secs
      else if (id === 'Z7') z7 = secs
    }
  } else {
    z1 = zones.Z1 || 0
    z2 = zones.Z2 || 0
    z3 = zones.Z3 || 0
    z4 = zones.Z4 || 0
    z5 = zones.Z5 || 0
    z6 = zones.Z6 || 0
    z7 = zones.Z7 || 0
  }
  
  const z1z2 = z1 + z2
  const z5z6z7 = z5 + z6 + z7
  const total = z1z2 + z3 + z4 + z5z6z7
  
  return { z1z2, z3, z4, z5z6z7, total }
}

function getKeyBlockZoneSummary(keyBlocks: KeyBlock[] | null | undefined): {
  threshold: number
  vo2: number
  tempo: number
  total: number
} {
  if (!keyBlocks || keyBlocks.length === 0) {
    return { threshold: 0, vo2: 0, tempo: 0, total: 0 }
  }
  
  let threshold = 0
  let vo2 = 0
  let tempo = 0
  
  for (const block of keyBlocks) {
    const dur = block.duration_sec || 0
    const zone = block.zone?.toUpperCase()
    
    if (zone === 'Z4') {
      threshold += dur
    } else if (zone === 'Z5' || zone === 'Z6' || zone === 'Z7') {
      vo2 += dur
    } else if (zone === 'Z3') {
      tempo += dur
    }
  }
  
  const total = threshold + vo2 + tempo
  return { threshold, vo2, tempo, total }
}

/**
 * Classify a ride based on its power data, key blocks, and duration.
 * 
 * Classification logic:
 * 1. Race: Check label for race keywords
 * 2. Recovery: Short duration, mostly Z1-Z2
 * 3. Long ride: Duration > 3 hours
 * 4. VO2max: Significant Z5-Z7 time or VO2 key blocks
 * 5. Threshold: Significant Z4 time or threshold key blocks
 * 6. Tempo: Significant Z3 time or tempo key blocks
 * 7. Endurance: Mostly Z1-Z2 with some Z3
 * 8. Mixed: No dominant pattern (fallback)
 */
export function classifySession(ride: Partial<Ride>): SessionType {
  const duration = ride.duration_min || 0
  const label = (ride.label || '').toLowerCase()
  const zones = ride.zones_power_sec
  const keyBlocks = ride.key_blocks
  
  // 1. Check for race in label
  if (label.includes('race') || label.includes('competition') || label.includes('event')) {
    return 'race'
  }
  
  // Get zone distribution
  const zoneTime = normalizeZones(zones)
  const keyBlockSummary = getKeyBlockZoneSummary(keyBlocks)
  
  // If no power data, fall back to duration-based classification
  if (zoneTime.total === 0 && keyBlockSummary.total === 0) {
    if (duration > 180) return 'long_ride'
    if (duration < 45) return 'recovery'
    return ride.session_type || 'endurance'
  }
  
  // Calculate percentages
  const z1z2Pct = zoneTime.total > 0 ? zoneTime.z1z2 / zoneTime.total : 0
  const z3Pct = zoneTime.total > 0 ? zoneTime.z3 / zoneTime.total : 0
  const z4Pct = zoneTime.total > 0 ? zoneTime.z4 / zoneTime.total : 0
  const z5z6z7Pct = zoneTime.total > 0 ? zoneTime.z5z6z7 / zoneTime.total : 0
  
  // Key block percentages
  const thresholdPct = keyBlockSummary.total > 0 ? keyBlockSummary.threshold / keyBlockSummary.total : 0
  const vo2Pct = keyBlockSummary.total > 0 ? keyBlockSummary.vo2 / keyBlockSummary.total : 0
  const tempoPct = keyBlockSummary.total > 0 ? keyBlockSummary.tempo / keyBlockSummary.total : 0
  
  // 2. Recovery: Short ride, mostly Z1-Z2
  if (duration < 60 && z1z2Pct > 0.8) {
    return 'recovery'
  }
  
  // 3. Long ride: Duration > 3 hours
  // But classify based on intensity if there's significant high-zone work
  if (duration > 180) {
    // If there's substantial high-intensity work, classify accordingly
    if (vo2Pct > 0.3 || z5z6z7Pct > 0.15) {
      return 'vo2'
    }
    if (thresholdPct > 0.3 || z4Pct > 0.15) {
      return 'threshold'
    }
    // For long rides with mixed intensity, still call it long_ride
    return 'long_ride'
  }
  
  // 4. VO2max: Significant Z5-Z7 work
  // Key blocks in VO2 zone or significant Z5-Z7 time
  if (keyBlockSummary.vo2 > 300 || // 5+ min of VO2 key blocks
      vo2Pct > 0.4 ||
      z5z6z7Pct > 0.12) {
    return 'vo2'
  }
  
  // 5. Threshold: Significant Z4 work
  if (keyBlockSummary.threshold > 600 || // 10+ min of threshold key blocks
      thresholdPct > 0.4 ||
      z4Pct > 0.2) {
    return 'threshold'
  }
  
  // 6. Tempo: Significant Z3 work
  if (keyBlockSummary.tempo > 900 || // 15+ min of tempo key blocks
      tempoPct > 0.5 ||
      z3Pct > 0.35) {
    return 'tempo'
  }
  
  // 7. Endurance: Mostly Z1-Z2
  if (z1z2Pct > 0.6 && z4Pct < 0.05 && z5z6z7Pct < 0.03) {
    return 'endurance'
  }
  
  // 8. Mixed: No dominant pattern - try to give a best guess
  // If there's meaningful intensity, classify by dominant zone
  if (z4Pct > z3Pct && z4Pct > z5z6z7Pct) {
    return 'threshold'
  }
  if (z5z6z7Pct > z3Pct && z5z6z7Pct > z4Pct) {
    return 'vo2'
  }
  if (z3Pct > 0.15) {
    return 'tempo'
  }
  
  return 'mixed'
}

/**
 * Get a human-readable label for a session type
 */
export function getSessionTypeLabel(type: SessionType): string {
  const labels: Record<SessionType, string> = {
    threshold: 'Threshold',
    tempo: 'Tempo',
    endurance: 'Endurance',
    vo2: 'VO2max',
    mixed: 'Mixed',
    long_ride: 'Long Ride',
    recovery: 'Recovery',
    race: 'Race',
  }
  return labels[type] || type
}

/**
 * Get color for session type (for UI display)
 */
export function getSessionTypeColor(type: SessionType): string {
  const colors: Record<SessionType, string> = {
    threshold: '#ef4444', // red
    tempo: '#f97316',     // orange
    endurance: '#22c55e', // green
    vo2: '#a855f7',       // purple
    mixed: '#6b7280',     // gray
    long_ride: '#3b82f6', // blue
    recovery: '#06b6d4',  // cyan
    race: '#ec4899',      // pink
  }
  return colors[type] || '#6b7280'
}
