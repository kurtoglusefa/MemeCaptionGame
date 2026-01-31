import { apiFetch } from './http';

export const startGame = () =>
  apiFetch('/game/start', {
    method: 'POST',
  });

export const submitAnswer = ({ gameId, memeId, captionId, timeTaken }) =>
  apiFetch('/game/answer', {
    method: 'POST',
    body: JSON.stringify({ gameId, memeId, captionId, timeTaken }),
  });
