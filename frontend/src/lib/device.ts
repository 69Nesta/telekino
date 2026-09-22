export function getDefaultDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Web Remote'

  const platform = navigator.platform?.toLowerCase() || ''
  const platformName = platform.includes('mac')
    ? 'Mac'
    : platform.includes('win')
      ? 'Windows'
      : platform.includes('linux')
        ? 'Linux'
        : navigator.platform?.replace(/\s+/g, ' ').trim()

  if (platformName) return `${platformName} Remote`
  return 'Web Remote'
}
