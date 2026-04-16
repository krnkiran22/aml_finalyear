const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ error: 'Invalid response' }));

  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? 'Request failed', data.details);
  }

  return data as T;
}

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('cg_token') ?? undefined;
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET' }, token ?? getToken()),

  post: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token ?? getToken()),

  patch: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token ?? getToken()),

  upload: <T>(path: string, formData: FormData, token?: string): Promise<T> => {
    const hdrs: Record<string, string> = {};
    const t = token ?? getToken();
    if (t) hdrs['Authorization'] = `Bearer ${t}`;
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      body: formData,
      headers: hdrs,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({ error: 'Invalid response' }));
      if (!res.ok) throw new ApiError(res.status, data.error ?? 'Upload failed', data.details);
      return data as T;
    });
  },
};

export { ApiError };
