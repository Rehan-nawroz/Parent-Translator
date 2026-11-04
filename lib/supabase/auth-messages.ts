/**
 * Maps provider auth failures to safe, plain-language messages. Raw provider text is never shown,
 * and account existence is not confirmed.
 */
export function safeAuthMessage(message?: string | null): string {
  const text = (message ?? "").toLowerCase();

  if (text.includes("invalid login") || text.includes("invalid credentials")) {
    return "That email or password did not match. Please try again.";
  }
  if (text.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (text.includes("rate limit") || text.includes("too many")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (text.includes("password")) {
    return "That password was not accepted. Use at least 8 characters and try again.";
  }
  if (text.includes("email")) {
    return "That email address could not be used. Check it and try again.";
  }
  if (text.includes("already registered") || text.includes("already exists")) {
    return "We could not create that account. Try signing in, or use a different email address.";
  }

  return "We could not complete that request. Please try again.";
}
