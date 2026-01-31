const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = data?.error || data?.message || 'Request failed';
    throw new Error(error);
  }

  return data;
};
