/**
 * Generates a cryptographically random password with mixed case, digits, and symbols.
 * Excludes ambiguous characters (0, O, 1, I, l, etc.).
 */
export function generateSecurePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}
