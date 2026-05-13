const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(res.status, body.message ?? 'Request failed', body.code, body.errors);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const apiClient = {
  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...getAuthHeader(), ...init?.headers },
    });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...init?.headers,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...init?.headers,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T = void>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      ...init,
      headers: { ...getAuthHeader(), ...init?.headers },
    })
    return handleResponse<T>(res)
  },

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    })
    return handleResponse<T>(res)
  },
}
