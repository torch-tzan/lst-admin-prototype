export const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  if (!pw) return { score: 0, label: "", color: "bg-muted" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;

  if (s <= 1) return { score: 1, label: "弱い", color: "bg-destructive" };
  if (s === 2) return { score: 2, label: "普通", color: "bg-yellow-500" };
  if (s === 3) return { score: 3, label: "強い", color: "bg-green-500" };
  return { score: 4, label: "とても強い", color: "bg-green-600" };
};
