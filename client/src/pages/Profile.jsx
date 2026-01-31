import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'design-react-kit';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as profileApi from '../api/profile';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalScore: 0,
    recentGames: [],
    recentRounds: [],
  });

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await profileApi.getProfileSummary();
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card-elevated p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h2 className="h4 fw-semibold mb-1">Profile</h2>
            <p className="text-muted-soft mb-0">
              Signed in as <strong>{user?.username}</strong>
            </p>
          </div>
          <div className="text-md-end">
            <div className="text-muted-soft">Total score</div>
            <div className="display-6 fw-bold">{summary.totalScore}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="card-elevated p-4 h-100">
              <h3 className="h5 fw-semibold mb-3">Recent games</h3>
              {summary.recentGames.length === 0 ? (
                <p className="text-muted-soft">No games played yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {summary.recentGames.map((game) => (
                    <div
                      key={game.id}
                      className="border rounded-4 p-3 d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">
                          Game #{game.id}
                        </div>
                        <small className="text-muted-soft">
                          {game.started_at
                            ? dateFormatter.format(new Date(game.started_at))
                            : 'In progress'}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold">{game.total_score}</div>
                        <small className="text-muted-soft">
                          {game.rounds_played}/{game.rounds_total} rounds
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="card-elevated p-4 h-100">
              <h3 className="h5 fw-semibold mb-3">Recent rounds</h3>
              {summary.recentRounds.length === 0 ? (
                <p className="text-muted-soft">No rounds played yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th scope="col">Meme</th>
                        <th scope="col">Score</th>
                        <th scope="col">Outcome</th>
                        <th scope="col">Played</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.recentRounds.map((roundData) => (
                        <tr key={roundData.id}>
                          <td>
                            <img
                              src={`/memes/${roundData.image_url}`}
                              alt={`Meme ${roundData.meme_id}`}
                              className="rounded-3"
                              style={{ width: '72px', height: '72px' }}
                            />
                          </td>
                          <td className="fw-semibold">{roundData.score}</td>
                          <td>
                            {roundData.is_correct ? (
                              <span className="badge badge-soft">Best match</span>
                            ) : (
                              <span className="badge text-bg-light">Missed</span>
                            )}
                          </td>
                          <td className="text-muted-soft">
                            {roundData.created_at
                              ? dateFormatter.format(new Date(roundData.created_at))
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="d-flex gap-2">
        <Button color="primary" onClick={() => navigate('/game')}>
          Play again
        </Button>
        <Button color="secondary" outline onClick={() => navigate('/')}>
          Back home
        </Button>
      </div>
    </div>
  );
};

export default Profile;
