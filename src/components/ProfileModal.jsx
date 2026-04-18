import React, { useState, useEffect } from 'react';
import api from '../api/api';

function ProfileModal({ username, onClose, onLogout, onUsernameChange }) {
  const [newUsername,   setNewUsername]   = useState('');
  const [newPassword,   setNewPassword]   = useState('');
  const [confirmPass,   setConfirmPass]   = useState('');
  const [email,         setEmail]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [initLoading,   setInitLoading]   = useState(true);
  const [success,       setSuccess]       = useState('');
  const [error,         setError]         = useState('');
  const [showDelete,    setShowDelete]    = useState(false);
  const [testLoading,   setTestLoading]   = useState(false);

  // Load current user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get('/user/profile');
        setEmail(res.data.email || '');
      } catch {
        // Profile endpoint not available — silently ignore
      } finally {
        setInitLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPassword && newPassword !== confirmPass) { setError('Passwords do not match!'); return; }
    if (!newUsername && !newPassword && !email) { setError('Please update at least one field!'); return; }
    setLoading(true);
    try {
      await api.put('/user', {
        userName:          newUsername || username,
        passWord:          newPassword || 'keep_current_password',
        email:             email,
      });
      setSuccess('Profile updated successfully!');
      if (newUsername) { onUsernameChange(newUsername); }
      if (newPassword) setTimeout(() => onLogout(), 2000);
    } catch (err) {
      setError(err.response?.data || 'Update failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    try { await api.delete('/user'); onLogout(); }
    catch (err) { setError('Delete failed: ' + err.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#161b22] rounded-[2rem] border border-gray-800 w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto main-scroll">

        {/* Header */}
        <div className="sticky top-0 bg-[#161b22] z-10 p-6 pb-4 border-b border-gray-800/60 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Profile Settings</h2>
            <p className="text-gray-600 text-xs mt-0.5">@{username}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 rounded-xl hover:bg-gray-800 flex items-center justify-center transition-all">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Account Details ── */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Account Details</h3>

            <div>
              <label className="text-gray-500 text-xs mb-1.5 block">New Username</label>
              <input type="text" value={newUsername} onChange={e=>setNewUsername(e.target.value)}
                placeholder={username}
                className="w-full bg-[#0b0e14] border border-gray-800 focus:border-purple-500/60 p-3 rounded-xl text-white placeholder-gray-700 focus:outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs mb-1.5 block">New Password</label>
              <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                placeholder="New password..."
                className="w-full bg-[#0b0e14] border border-gray-800 focus:border-purple-500/60 p-3 rounded-xl text-white placeholder-gray-700 focus:outline-none text-sm transition-all"
              />
            </div>
            {newPassword && (
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block">Confirm Password</label>
                <input type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full bg-[#0b0e14] border border-gray-800 focus:border-purple-500/60 p-3 rounded-xl text-white placeholder-gray-700 focus:outline-none text-sm transition-all"
                />
              </div>
            )}

            {/* ── Email ── */}
            <div className="border-t border-gray-800/60 pt-4 space-y-4">
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block">Email Address</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#0b0e14] border border-gray-800 focus:border-purple-500/60 p-3 rounded-xl text-white placeholder-gray-700 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            {error   && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
            {success && <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-xl">{success}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? 'Saving...' : '✓ Save All Changes'}
            </button>
          </form>

          {/* ── Danger Zone ── */}
          <div className="border-t border-gray-800/60 pt-4">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-3">Danger Zone</p>
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)}
                className="w-full border border-red-500/25 text-red-500/70 hover:bg-red-500/10 hover:text-red-400 py-2.5 rounded-xl text-sm transition-all">
                🗑️ Delete Account
              </button>
            ) : (
              <div className="bg-red-500/8 border border-red-500/25 p-4 rounded-xl space-y-3">
                <p className="text-red-400 text-sm">Are you sure? All your data will be permanently deleted!</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDelete(false)} className="flex-1 text-gray-500 hover:text-white text-sm py-2 transition-colors">Cancel</button>
                  <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-xl transition-all">Yes, Delete</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
