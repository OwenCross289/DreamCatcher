export function getAllowedEmails(raw = process.env.AUTH_ALLOWED_EMAILS ?? '') {
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isEmailAllowed(
  email: string,
  allowedEmails = getAllowedEmails(),
) {
  return allowedEmails.has(email.trim().toLowerCase())
}
