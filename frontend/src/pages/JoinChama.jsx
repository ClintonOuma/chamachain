import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invitationService from '../services/invitationService';
import usePageTitle from '../hooks/usePageTitle';
import './JoinChama.css';

const JoinChama = () => {
  usePageTitle('Join Chama');
  const [inviteCode, setInviteCode] = useState('');
  const [chamaInfo, setChamaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLookupChama = async () => {
    if (inviteCode.length !== 6) {
      setError('Invite code must be 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await invitationService.getChamaByInviteCode(inviteCode.toUpperCase());
      setChamaInfo(data);
    } catch (err) {
      setError(err.message);
      setChamaInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChama = async () => {
    setJoining(true);
    setError('');
    setSuccess('');
    
    try {
      await invitationService.joinChamaByCode(inviteCode.toUpperCase());
      setSuccess('Successfully joined the chama!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInviteCode(value);
    if (value.length === 6) {
      handleLookupChama();
    } else {
      setChamaInfo(null);
      setError('');
    }
  };

  return (
    <div className="join-chama-container">
      <div className="join-chama-card glass-card">
        <div className="join-chama-header">
          <h1>Join Chama</h1>
          <p>Enter the 6-digit invite code to join a savings group</p>
        </div>

        <div className="invite-code-input">
          <input
            type="text"
            value={inviteCode}
            onChange={handleInputChange}
            placeholder="ABC123"
            maxLength={6}
            className="glass-input"
          />
          {loading && <div className="loading-spinner"></div>}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {chamaInfo && (
          <div className="chama-info glass-card">
            <div className="chama-header">
              <h3>{chamaInfo.name}</h3>
              <span className="member-count">{chamaInfo.memberCount} members</span>
            </div>
            <p className="chama-description">{chamaInfo.description}</p>
            <div className="chama-meta">
              <span>Created by: {chamaInfo.createdBy?.fullName}</span>
            </div>
            <button
              onClick={handleJoinChama}
              disabled={joining}
              className="join-button glass-button"
            >
              {joining ? 'Joining...' : 'Join Chama'}
            </button>
          </div>
        )}

        <div className="help-text">
          <p>
            Don't have an invite code? Ask your chama admin for the 6-digit code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinChama;
