import { apiFetch } from './http';

export const getProfileSummary = () => apiFetch('/profile/me');
