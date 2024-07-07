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
  const [timerInterval, setTimerInterval] = useState(null);
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
    return () => clearInterval(timerInterval);
  }, []);

  const startGame = async () => {
    setLoading(true);
    try {
      const { meme, captions } = await API.startGame();
      setMeme(meme);
      setCaptions(captions);

      // Filter and set best match captions
      const bestMatches = captions.filter(caption => caption.is_best_match);
      setBestMatchCaptions(bestMatches);

      // Start countdown timer
      const interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(interval);
            handleRoundEnd();
            return 0;
          }
        });
      }, 1000);

      setTimerInterval(interval);
      setLoading(false);
    } catch (error) {
      console.error('Failed to start the game:', error);
      setLoading(false);
    }
  };

  const handleCaptionSelect = async (captionId) => {
    if (timeRemaining > 0 && selectedCaptionId === null) {
      setSelectedCaptionId(captionId);

      const selectedCaption = captions.find(caption => caption.id === captionId);
      let updatedScore = score;

      if (selectedCaption.is_best_match) {
        updatedScore += 5; // Add 5 points for correct selection
        setRoundEndMessage('Congratulations! You selected one of the most appropriate captions.');
      } else {
        updatedScore = 0; // Reset score if incorrect selection
        setRoundEndMessage('Sorry, you did not select one of the most appropriate captions.');
      }

      setScore(updatedScore);

      // Submit the answer
      try {
        await API.submitAnswer(user.id, meme.id, captionId);
      } catch (error) {
        console.error('Failed to submit answer:', error);
      }

      clearInterval(timerInterval);
    }
  };



  const handleNextMeme = async () => {
    if (round < 3) {
      setLoading(true);
      try {
        const { meme, captions } = await API.nextMeme();
        setMeme(meme);
        setCaptions(captions);
        setTimeRemaining(30);
        setSelectedCaptionId(null);
        setRoundEndMessage('');

        // Filter and set best match captions for the next meme
        const bestMatches = captions.filter(caption => caption.is_best_match);
        setBestMatchCaptions(bestMatches);

        // Restart countdown timer
        const interval = setInterval(() => {
          setTimeRemaining(prevTime => {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              clearInterval(interval);
              handleRoundEnd();
              return 0;
            }
          });
        }, 1000);

        setTimerInterval(interval);
        setRound(round + 1); // Increment round counter
      } catch (error) {
        console.error('Error fetching next meme and captions:', error);
      } finally {
        setLoading(false);
      }
    } else {
      endGame(); // End the game after 3 rounds
    }
  };

  const handleRoundEnd = () => {
    if (selectedCaptionId === null) {
      setRoundEndMessage("Time's up! You did not select a caption.");
    }
  };

  const renderBestMatchCaptions = () => {
    return (
      <div>
        <h3>Best Match Captions</h3>
        <ul>
          {bestMatchCaptions.map((caption, index) => (
            <li key={`${caption.id}-${index}`}>{caption.text}</li>
          ))}
        </ul>
      </div>
    );
  };

  const endGame = async () => {
    try {
      await API.recordGameHistory(user.id, meme.id, selectedCaptionId, score);
      setGameScore(prevScore => prevScore + score); // Update total game score
      navigate('/profile'); // Navigate to profile page after game ends
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
            {timeRemaining > 0 ? (
              <p>Time remaining: {timeRemaining} seconds</p>
            ) : (
              <p>Time's up!</p>
            )}
            {roundEndMessage && <p>{roundEndMessage}</p>}
            {bestMatchCaptions.length > 0 && renderBestMatchCaptions()}
            <button onClick={handleNextMeme} disabled={selectedCaptionId === null}>
              {round < 3 ? 'Next Meme' : 'End Game'}
            </button>
          </div>
        </>
      ) : (
        <p>No meme available</p>
      )}

      {/* Example button to end the game */}
      <button onClick={endGame}>End Game</button>
    </div>
  );
}

export default Game;
