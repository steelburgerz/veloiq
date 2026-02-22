export function getTitiDaysRemaining(): number {
  const titiDate = new Date('2026-04-25')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = titiDate.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
