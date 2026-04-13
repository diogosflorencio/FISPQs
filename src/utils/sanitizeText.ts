/**
 * Reduz risco de XSS quando texto de usuário é exibido (ou futuramente renderizado em WebView).
 * Não substitui validação no servidor; use também limites de tamanho no banco.
 */
export function sanitizePlainText(input: string, maxLen: number): string {
  const t = input.trim().slice(0, maxLen);
  return t
    .replace(/</g, '')
    .replace(/>/g, '')
    .replace(/&/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/\u0000/g, '');
}
