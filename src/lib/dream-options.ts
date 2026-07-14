export const moods = [
  'mysterious',
  'peaceful',
  'joyful',
  'melancholy',
  'surreal',
  'frightening',
] as const

export const visualStyles = [
  'storybook',
  'cinematic',
  'watercolor',
  'ethereal',
  'surrealist',
  'photographic',
] as const

export const moodEmoji: Record<(typeof moods)[number], string> = {
  mysterious: '🌙',
  peaceful: '☁️',
  joyful: '✨',
  melancholy: '🌧️',
  surreal: '🪐',
  frightening: '🌑',
}

export function getMoodEmoji(mood: string) {
  return Object.hasOwn(moodEmoji, mood)
    ? moodEmoji[mood as keyof typeof moodEmoji]
    : '🌙'
}
