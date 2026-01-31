import { apiFetch } from './http';

export const login = (credentials) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const logout = () =>
  apiFetch('/auth/logout', {
    method: 'POST',
  });

export const getUser = () => apiFetch('/auth/user');
