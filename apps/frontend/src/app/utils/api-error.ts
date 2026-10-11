/**
 * Extrait un message lisible d'une erreur HTTP de l'API.
 * Les erreurs de validation NestJS renvoient un tableau de messages : ils sont
 * alors présentés un par ligne (les blocs d'erreur utilisent `white-space: pre-line`).
 */
export function formatApiError(error: unknown, fallback: string): string {
  const message = (error as { error?: { message?: unknown } })?.error?.message;

  if (Array.isArray(message)) {
    const messages = message.filter(
      (m): m is string => typeof m === 'string' && m.trim().length > 0,
    );
    return messages.length ? messages.join('\n') : fallback;
  }
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }
  return fallback;
}
