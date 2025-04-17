import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import '../Game.css';

function Game() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaptionId, setSelectedCaptionId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [score, setScore] = useState(0);
  const [roundEndMessage, setRoundEndMessage] = useState('');
  const [bestMatchCaptions, setBestMatchCaptions] = useState([]);
  const [round, setRound] = useState(1);
  const [gameScore, setGameScore] = useState(0);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await API.getUserInfo();
        setUser(userInfo);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    fetchUserInfo();
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer logic: when timeRemaining changes, decrement until time is up.
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && selectedCaptionId === null) {
      handleRoundEnd();
    }
  }, [timeRemaining, selectedCaptionId]);

  const startGame = async () => {
    setLoading(true);
    try {
      const { meme, captions } = await API.startGame();
      setMeme(meme);
      setCaptions(captions);
      setBestMatchCaptions(captions.filter(caption => caption.is_best_match));
      setTimeRemaining(30);
      setSelectedCaptionId(null);
      setRoundEndMessage('');
    } catch (error) {
      console.error('Failed to start the game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptionSelect = async (captionId) => {
    if (timeRemaining > 0 && selectedCaptionId === null) {
      setSelectedCaptionId(captionId);
      const selectedCaption = captions.find(caption => caption.id === captionId);
      let updatedScore = score;
      if (selectedCaption.is_best_match) {
        updatedScore += 5;
        setRoundEndMessage('Congratulations! You selected an appropriate caption.');
      } else {
        updatedScore = 0;
        setRoundEndMessage('Sorry, that was not one of the best captions.');
      }
      setScore(updatedScore);
      try {
        await API.submitAnswer(user.id, meme.id, captionId);
      } catch (error) {
        console.error('Failed to submit answer:', error);
      }
    }
  };

  const handleNextMeme = async () => {
    if (round < 3) {
      setRound(round + 1);
      startGame();
    } else {
      endGame();
    }
  };

  const handleRoundEnd = () => {
    if (selectedCaptionId === null) {
      setRoundEndMessage("Time's up! You did not select a caption.");
    }
  };

  const endGame = async () => {
    try {
      await API.recordGameHistory(user.id, meme.id, selectedCaptionId, score);
      setGameScore(prev => prev + score);
      navigate('/profile');
    } catch (error) {
      console.error('Failed to record game history:', error);
    }
  };

  return (
    <div className="game-container">
      <h2>Game</h2>
      {loading ? (
        <p>Loading...</p>
      ) : meme && captions.length > 0 ? (
        <>
          <div className="game-content">
            <div className="meme-container">
              <img className="meme-image" src={`/memes/meme${meme.id}.jpg`} alt="Meme" />
            </div>
            <div className="captions-section">
              <h3>Captions</h3>
              <ul className="caption-list">
                {captions.map((caption, index) => (
                  <li
                    key={`${caption.id}-${index}`}
                    className={selectedCaptionId === caption.id ? 'caption-item selected' : 'caption-item'}
                    onClick={() => handleCaptionSelect(caption.id)}
                  >
                    {caption.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="game-info">
            <h3>Round {round}</h3>
            <p>{timeRemaining > 0 ? `Time remaining: ${timeRemaining} seconds` : "Time's up!"}</p>
            {roundEndMessage && <p>{roundEndMessage}</p>}
            {bestMatchCaptions.length > 0 && (
              <div>
                <h3>Best Match Captions</h3>
                <ul>
                  {bestMatchCaptions.map((caption, index) => (
                    <li key={`${caption.id}-${index}`}>{caption.text}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={handleNextMeme}>
              {round < 3 ? 'Next Meme' : 'End Game'}
            </button>
          </div>
        </>
      ) : (
        <p>No meme available</p>
      )}
    </div>
  );
}

export default Game;
