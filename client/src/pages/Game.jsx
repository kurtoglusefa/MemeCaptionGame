import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'design-react-kit';
import { useNavigate } from 'react-router-dom';
import * as gameApi from '../api/game';

const ROUND_SECONDS = 30;

const Game = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameId, setGameId] = useState(null);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [selectedCaptionId, setSelectedCaptionId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(ROUND_SECONDS);
  const [roundResult, setRoundResult] = useState(null);
  const [nextRound, setNextRound] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const roundActive = useMemo(
    () => !loading && !roundResult && !gameOver && Boolean(meme),
    [loading, roundResult, gameOver, meme]
  );

  const resetRoundState = () => {
    setSelectedCaptionId(null);
    setTimeRemaining(ROUND_SECONDS);
    setRoundResult(null);
    setNextRound(null);
  };

  const initializeGame = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await gameApi.startGame();
      setGameId(data.gameId);
      setRound(data.round);
      setTotalRounds(data.totalRounds);
      setMeme(data.meme);
      setCaptions(data.captions);
      setTotalScore(0);
      resetRoundState();
      setGameOver(false);
    } catch (err) {
      setError(err.message || 'Unable to start the game.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (!roundActive || selectedCaptionId || isSubmitting) {
      return undefined;
    }
    if (timeRemaining <= 0) {
      handleSubmit(null, true);
      return undefined;
    }
    const timer = setTimeout(
      () => setTimeRemaining((prev) => prev - 1),
      1000
    );
    return () => clearTimeout(timer);
  }, [roundActive, timeRemaining, selectedCaptionId, isSubmitting]);

  const handleSubmit = async (captionId, timedOut = false) => {
    if (!meme || !gameId) return;
    setIsSubmitting(true);
    setError('');
    try {
      const timeTaken = ROUND_SECONDS - timeRemaining;
      const response = await gameApi.submitAnswer({
        gameId,
        memeId: meme.id,
        captionId,
        timeTaken,
      });
      setTotalScore(response.totalScore);
      const successMessage = 'Great pick! That was a top caption.';
      const failMessage = timedOut
        ? "Time's up. No caption selected."
        : 'Not one of the best captions. Try the next meme!';
      setRoundResult({
        message: response.answeredCorrectly ? successMessage : failMessage,
        variant: response.answeredCorrectly ? 'success' : 'danger',
        bestMatches: response.bestMatches ?? [],
      });
      if (response.gameOver) {
        setGameOver(true);
      } else {
        setNextRound(response.nextRound);
      }
      if (captionId) {
        setSelectedCaptionId(captionId);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit your answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptionClick = (captionId) => {
    if (!roundActive || selectedCaptionId) return;
    setSelectedCaptionId(captionId);
    handleSubmit(captionId);
  };

  const handleNextRound = () => {
    if (!nextRound) return;
    setRound(nextRound.round || round + 1);
    setMeme(nextRound.meme);
    setCaptions(nextRound.captions);
    resetRoundState();
  };

  const progressValue = (timeRemaining / ROUND_SECONDS) * 100;

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card-elevated p-4 d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3">
        <div>
          <h2 className="h4 fw-semibold mb-1">Round {round}</h2>
          <p className="text-muted-soft mb-0">
            Total score: <strong>{totalScore}</strong>
          </p>
        </div>
        <div className="text-lg-end">
          <div className="text-muted-soft mb-2">
            {timeRemaining}s left · {round} / {totalRounds}
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={Math.round(progressValue)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-bar bg-primary"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {meme && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card-elevated p-3">
              <img
                src={`/memes/${meme.image_url}`}
                alt="Meme"
                className="img-fluid rounded-4"
              />
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card-elevated p-4 h-100">
              <h3 className="h5 fw-semibold mb-3">Pick the best caption</h3>
              <div className="d-grid gap-2">
                {captions.map((caption) => (
                  <button
                    key={caption.id}
                    type="button"
                    className={`btn btn-outline-primary text-start ${
                      selectedCaptionId === caption.id ? 'active' : ''
                    }`}
                    onClick={() => handleCaptionClick(caption.id)}
                    disabled={!roundActive || isSubmitting}
                  >
                    {caption.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {roundResult && (
        <div className={`alert alert-${roundResult.variant}`} role="alert">
          <div className="fw-semibold mb-1">{roundResult.message}</div>
          {roundResult.bestMatches.length > 0 && (
            <div>
              <div className="small text-muted-soft mb-2">
                Best matching captions:
              </div>
              <ul className="mb-0">
                {roundResult.bestMatches.map((caption) => (
                  <li key={caption.id}>{caption.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="d-flex flex-wrap gap-2">
        {!gameOver && nextRound && (
          <Button color="primary" onClick={handleNextRound}>
            Next round
          </Button>
        )}
        {gameOver && (
          <>
            <Button color="primary" onClick={() => navigate('/profile')}>
              View profile
            </Button>
            <Button color="secondary" outline onClick={initializeGame}>
              Play again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
