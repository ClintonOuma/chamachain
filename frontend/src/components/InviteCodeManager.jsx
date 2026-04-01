import { useState } from 'react';
import invitationService from '../services/invitationService';
import './InviteCodeManager.css';

const InviteCodeManager = ({ chamaId, currentInviteCode, onInviteCodeChange }) => {
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    setError('');
    
    try {
      const data = await invitationService.regenerateInviteCode(chamaId);
      onInviteCodeChange(data.inviteCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentInviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy code');
    }
  };

  return (
    <div className="invite-code-manager glass-card">
      <div className="invite-code-header">
        <h3>Invite Members</h3>
        <p>Share this 6-digit code with people you want to invite to your chama</p>
      </div>

      <div className="invite-code-display">
        <div className="code-container">
          <span className="code-text">{currentInviteCode}</span>
          <button
            onClick={handleCopyCode}
            className="copy-button glass-button"
            title="Copy code"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>

      <div className="invite-code-actions">
        <button
          onClick={handleRegenerateCode}
          disabled={regenerating}
          className="regenerate-button glass-button"
        >
          {regenerating ? 'Regenerating...' : '🔄 Generate New Code'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="invite-instructions">
        <h4>How to invite members:</h4>
        <ol>
          <li>Share this 6-digit code with potential members</li>
          <li>They can enter it in the "Join Chama" section</li>
          <li>Once they join, you'll see them in your members list</li>
          <li>You can change their role from Member to Treasurer if needed</li>
        </ol>
      </div>
    </div>
  );
};

export default InviteCodeManager;
