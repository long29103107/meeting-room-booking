const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', 'Basic ' + token);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(apiBase + path, { ...init, headers });
  if (!response.ok) {
    let message = 'HTTP ' + response.status;
    try {
      const result = await response.json();
      message = result.message || result.error || message;
    } catch { /* Keep the status fallback when the response is not JSON. */ }
    throw new ApiError(message, response.status);
  }
  return (response.status === 204 ? null : await response.json()) as T;
}
