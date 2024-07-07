import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import '../Profile.css';

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

function Profile() {
  const [user1Scores, setUser1Scores] = useState([]);
  const [user2Scores, setUser2Scores] = useState([]);
  const [user1TotalScore, setUser1TotalScore] = useState(0);
  const [user2TotalScore, setUser2TotalScore] = useState(0);
  const [gameState, setGameState] = useState({
    roundsPlayed: 0,
    gameCompleted: false,
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const user1Id = 1;
      const user2Id = 2;
      const user1ScoresResponse = await API.getScoresByUserId(user1Id);
      const user2ScoresResponse = await API.getScoresByUserId(user2Id);

      setUser1Scores(
        user1ScoresResponse
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3)
      );
      setUser2Scores(
        user2ScoresResponse
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3)
      );

      const [totalScore1, totalScore2] = await Promise.all([
        API.getTotalScoreByUserId(user1Id),
        API.getTotalScoreByUserId(user2Id),
      ]);
      setUser1TotalScore(totalScore1.totalScore);
      setUser2TotalScore(totalScore2.totalScore);
    } catch (error) {
      console.error('Failed to fetch scores', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndGame = async () => {
    console.log("handleEndGame called");
    if (gameState.roundsPlayed >= 3) {
      setGameState({
        ...gameState,
        gameCompleted: true,
      });

      try {
        const user1Id = 1;
        const user2Id = 2;

        // Record game history for both users
        for (const score of user1Scores) {
          await API.recordGameHistory(user1Id, score.meme_id, score.caption_id, score.score);
        }
        for (const score of user2Scores) {
          await API.recordGameHistory(user2Id, score.meme_id, score.caption_id, score.score);
        }
      } catch (error) {
        console.error('Failed to record game history', error);
      }

      navigate('/');
      console.log("Navigating to home page");
    } else {
      console.log("Not enough rounds played to end the game");
    }
  };

  const handleNewGame = async () => {
    console.log("handleNewGame called");
    setGameState({
      roundsPlayed: 0,
      gameCompleted: false,
    });
    setUser1Scores([]);
    setUser2Scores([]);
    setUser1TotalScore(0);
    setUser2TotalScore(0);
    fetchScores();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const calculateGameScore = (scores) => {
    let gameScore = 0;
    scores.forEach(score => {
      if (score.matchedCorrectly && score.timeTaken <= 30) {
        gameScore += 5;
      }
    });
    return gameScore;
  };

  console.log("gameState:", gameState);

  return (
    <div className="profile-container">
      <div className="scores-container">
        <div className="user-scores">
          <h3>User 1 Scores</h3>
          <p>Total Score: {user1TotalScore}</p>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Meme</th>
                  <th>Meme ID</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {user1Scores.map(score => (
                  <tr key={score.id}>
                    <td>
                      <img
                        src={`/memes/${score.image_url}`}
                        alt={`Meme ${score.meme_id}`}
                        style={{ width: '100px', height: '100px' }}
                        onError={(e) => e.target.src = '/images/placeholder.jpg'}
                      />
                    </td>
                    <td>{score.meme_id}</td>
                    <td>{score.score}</td>
                    <td>{dayjs(score.timestamp).tz(dayjs.tz.guess()).format('DD/MM/YYYY HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="user-scores">
          <h3>User 2 Scores</h3>
          <p>Total Score: {user2TotalScore}</p>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Meme</th>
                  <th>Meme ID</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {user2Scores.map(score => (
                  <tr key={score.id}>
                    <td>
                      <img
                        src={`/memes/${score.image_url}`}
                        alt={`Meme ${score.meme_id}`}
                        style={{ width: '100px', height: '100px' }}
                        onError={(e) => e.target.src = '/images/placeholder.jpg'}
                      />
                    </td>
                    <td>{score.meme_id}</td>
                    <td>{score.score}</td>
                    <td>{dayjs(score.timestamp).tz(dayjs.tz.guess()).format('DD/MM/YYYY HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {gameState.roundsPlayed >= 3 && (
        <div className="game-summary">
          <h3>Game Summary</h3>
          <p>Total Score for this Game: {calculateGameScore(user1Scores)}</p>
          <ul>
            {user1Scores.map(score => (
              <li key={score.id}>
                Meme ID: {score.meme_id}, Caption ID: {score.caption_id}, Score: {score.score}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="button-container">
        {!gameState.gameCompleted ? (
          <>
            <button onClick={handleEndGame}>End Game</button>
            <button onClick={handleNewGame}>New Game</button>
          </>
        ) : (
          <button onClick={handleNewGame}>New Game</button>
        )}
        <button onClick={handleGoHome}>Go to Home Page</button> {/* New button to go to Home page */}
      </div>
    </div>
  );
}

export default Profile;


