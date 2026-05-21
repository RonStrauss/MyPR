/** Pick a random celebration line (index stable per session is fine) */
export function pickCelebrationMessage(messages: string[]): string {
  if (messages.length === 0) return "";
  return messages[Math.floor(Math.random() * messages.length)]!;
}
