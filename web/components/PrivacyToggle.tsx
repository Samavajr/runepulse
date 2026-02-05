'use client';

import { useState } from 'react';

export default function PrivacyToggle() {
  const [token, setToken] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState('');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

  const save = async () => {
    setStatus('Saving...');
    try {
      const res = await fetch(`${apiBase}/profile/visibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublic })
      });

      if (!res.ok) {
        setStatus('Failed to update');
        return;
      }

      setStatus(isPublic ? 'Profile is public' : 'Profile is private');
    } catch {
      setStatus('Failed to update');
    }
  };

  return (
    <div className="card">
      <div className="stat-row" style={{ marginBottom: 8 }}>
        <strong>Privacy</strong>
        <span className="mono">Owner only</span>
      </div>
      <p className="subtitle">
        Toggle whether your profile is public. Use your pairing token to update.
      </p>
      <div className="grid" style={{ gap: 8 }}>
        <input
          className="input"
          placeholder="Paste pairing token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <label className="pill" style={{ justifyContent: 'space-between' }}>
          <span>Public profile</span>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </label>
        <button className="button" type="button" onClick={save}>Save</button>
        {status ? <span className="mono">{status}</span> : null}
      </div>
    </div>
  );
}
