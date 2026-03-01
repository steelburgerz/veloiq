import { Ride, SessionType, KeyBlock, ZonesSec } from '@/types'

/**
 * Auto-classify ride session type based on power zones, key blocks, and Intensity Factor.
 * 
 * Classification approach:
 * 1. Check label for known workout patterns (Zwift, TrainerRoad, etc.)
 * 2. Use Intensity Factor (IF) as primary guide when available
 * 3. Use power zone distribution as secondary indicator
 * 4. Use key blocks for structured workout detection
 * 
 * IF ranges for reference (FTP = 270W):
 * - Recovery: IF < 0.55 (NP < 150W)
 * - Endurance: IF 0.55-0.75 (NP 150-200W)
 * - Tempo: IF 0.75-0.85 (NP 200-230W)
 * - Sweet Spot/Threshold: IF 0.85-0.95 (NP 230-255W)
 * - VO2max: IF 0.95-1.05 (NP 255-285W)
 * - Anaerobic: IF > 1.05 (NP > 285W)
 */

interface ZoneTime {
  z1z2: number  // Recovery/Endurance
  z3: number    // Tempo
  z4: number    // Threshold/Sweet Spot
  z5z6z7: number // VO2max/Anaerobic
  total: number
}

function normalizeZones(zones: ZonesSec | null | undefined): ZoneTime {
  if (!zones) return { z1z2: 0, z3: 0, z4: 0, z5z6z7: 0, total: 0 }
  
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
 * Check label for known workout patterns
 */
function detectWorkoutType(label: string): SessionType | null {
  const lower = label.toLowerCase()
  
  // Race detection
  if (lower.includes('race') || lower.includes('competition') || lower.includes('event')) {
    return 'race'
  }
  
  // Workout pattern detection
  if (lower.includes('vo2') || lower.includes('v02') || lower.includes('5x') || lower.includes('4x') || lower.includes('6x')) {
    // Check if it's likely VO2 intervals
    if (lower.includes('vo2') || lower.includes('v02')) return 'vo2'
    // 4x, 5x, 6x patterns often indicate intervals - check context
    if (lower.match(/[4-6]x\s*\d/)) {
      // Could be VO2 or threshold depending on interval length
      return null // Let zone analysis decide
    }
  }
  
  // Over/Under workouts are threshold training
  if (lower.includes('over') && lower.includes('under')) {
    return 'threshold'
  }
  
  // Sweet spot workouts
  if (lower.includes('sweet spot') || lower.includes('sweetspot')) {
    return 'threshold'
  }
  
  // Tempo workouts
  if (lower.includes('tempo') && !lower.includes('tempo recovery')) {
    return 'tempo'
  }
  
  // Recovery rides
  if (lower.includes('recovery') || lower.includes('spin') || lower.includes('cool down')) {
    return 'recovery'
  }
  
  return null
}

/**
 * Classify a ride based on its power data, key blocks, duration, and IF.
 */
export function classifySession(ride: Partial<Ride>): SessionType {
  const duration = ride.duration_min || 0
  const label = (ride.label || '').toLowerCase()
  const zones = ride.zones_power_sec
  const keyBlocks = ride.key_blocks
  const ifFactor = ride.if // Intensity Factor (NP/FTP)
  
  // 1. Check for known workout patterns in label
  const workoutType = detectWorkoutType(label)
  if (workoutType) return workoutType
  
  // Get zone distribution
  const zoneTime = normalizeZones(zones)
  const keyBlockSummary = getKeyBlockZoneSummary(keyBlocks)
  
  // Calculate percentages
  const z1z2Pct = zoneTime.total > 0 ? zoneTime.z1z2 / zoneTime.total : 0
  const z3Pct = zoneTime.total > 0 ? zoneTime.z3 / zoneTime.total : 0
  const z4Pct = zoneTime.total > 0 ? zoneTime.z4 / zoneTime.total : 0
  const z5z6z7Pct = zoneTime.total > 0 ? zoneTime.z5z6z7 / zoneTime.total : 0
  
  // 2. Use Intensity Factor as primary guide if available
  if (ifFactor && ifFactor > 0) {
    // Long rides with moderate IF should be long_ride
    if (duration > 180) {
      if (ifFactor < 0.85) return 'long_ride'
      // High intensity long ride - could be race or hard group ride
      if (ifFactor >= 0.90 && z4Pct > 0.20) return 'threshold'
      if (ifFactor >= 0.95) return 'vo2'
      return 'long_ride'
    }
    
    // Short rides classified by IF
    if (duration < 60 && ifFactor < 0.60) return 'recovery'
    
    // IF-based classification for structured workouts
    if (ifFactor >= 0.95) {
      // Very high intensity - VO2 or anaerobic
      // Check zone distribution to differentiate
      if (z5z6z7Pct > 0.10) return 'vo2'
      if (z4Pct > 0.25) return 'threshold' // Might be long threshold intervals
      return 'vo2'
    }
    
    if (ifFactor >= 0.85) {
      // Threshold/Sweet Spot zone
      return 'threshold'
    }
    
    if (ifFactor >= 0.75) {
      // Tempo zone
      if (z3Pct > 0.30) return 'tempo'
      if (z4Pct > 0.15) return 'threshold' // Tempo with some threshold
      return 'tempo'
    }
    
    if (ifFactor >= 0.55) {
      // Endurance zone
      return 'endurance'
    }
    
    // Low IF - recovery
    return 'recovery'
  }
  
  // 3. Fall back to zone-based classification if no IF
  
  // If no power data, use duration
  if (zoneTime.total === 0 && keyBlockSummary.total === 0) {
    if (duration > 180) return 'long_ride'
    if (duration < 45) return 'recovery'
    return 'endurance'
  }
  
  // Recovery: Short ride, mostly Z1-Z2
  if (duration < 60 && z1z2Pct > 0.85) {
    return 'recovery'
  }
  
  // Long ride: Duration > 3 hours
  if (duration > 180) {
    // Only classify as intensity workout if there's substantial structured work
    if (keyBlockSummary.vo2 > 600 || z5z6z7Pct > 0.15) return 'vo2'
    if (keyBlockSummary.threshold > 900 || z4Pct > 0.30) return 'threshold'
    return 'long_ride'
  }
  
  // VO2max: Significant Z5-Z7 work
  if (keyBlockSummary.vo2 > 240 || // 4+ min of VO2 key blocks
      z5z6z7Pct > 0.10) {
    return 'vo2'
  }
  
  // Threshold: Significant Z4 work
  if (keyBlockSummary.threshold > 600 || // 10+ min of threshold key blocks
      z4Pct > 0.18) {
    return 'threshold'
  }
  
  // Tempo: Significant Z3 work
  if (keyBlockSummary.tempo > 900 || // 15+ min of tempo key blocks
      z3Pct > 0.30) {
    return 'tempo'
  }
  
  // Endurance: Mostly Z1-Z2
  if (z1z2Pct > 0.60) {
    return 'endurance'
  }
  
  // Mixed intensity - check dominant zone
  if (z4Pct > 0.10) return 'threshold'
  if (z3Pct > 0.15) return 'tempo'
  
  return 'endurance'
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
