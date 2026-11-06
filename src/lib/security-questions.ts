/** Questions whose answers are memorable but hard to find online. Avoids mother's maiden name, which is often public. */
export const SECURITY_QUESTIONS = [
  "What was the name of your first primary school?",
  "What was your childhood nickname?",
  "What was the name of your first pet?",
  "In which town or city did your parents meet?",
  "What was the make and model of your first car?",
  "What street did you live on when you were ten?",
  "What is the middle name of your oldest sibling or cousin?",
  "What was the first concert or show you went to?",
] as const;

export function isValidQuestion(q: string) {
  return (SECURITY_QUESTIONS as readonly string[]).includes(q);
}
