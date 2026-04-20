import React, { useState } from 'react';
import api from '../api/api';

function JournalCard({ id, date, title, content, mood, tags, onDelete, onUpdate, index = 0 }) {
  const [isEditing, setIsEditing]     = useState(false);
  const [editTitle, setEditTitle]     = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [saving, setSaving]           = useState(false);
  const [isExpanded, setIsExpanded]   = useState(false);

  const delay = `${index * 0.06}s`;

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const res = await api.put(`/journal/id/${id}`, { title: editTitle, content: editContent });
      onUpdate(id, res.data);
      setIsEditing(false);
    } catch (err) {
      alert('Update failed: ' + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Mode ──────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="glass rounded-3xl p-6 border border-purple-500/40 animate-fade-up"
           style={{ animationDelay: delay }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">✏️ Editing</span>
        </div>
        <input
          className="w-full bg-[#080b12] border border-gray-700/60 p-3.5 rounded-2xl text-white mb-3 focus:outline-none focus:border-purple-500 text-sm font-medium placeholder-gray-600 transition-all"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          placeholder="Title..."
        />
        <textarea
          className="w-full bg-[#080b12] border border-gray-700/60 p-3.5 rounded-2xl text-white h-32 resize-none focus:outline-none focus:border-purple-500 text-sm placeholder-gray-600 transition-all leading-relaxed"
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          placeholder="Write your thoughts..."
        />
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-white text-sm px-5 py-2.5 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-50 transition-all">
            {saving ? 'Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  const wordCount  = content?.split(/\s+/).filter(Boolean).length || 0;
  const readingMin = Math.max(1, Math.ceil(wordCount / 200));

  // ── View Mode ──────────────────────────────────────────────────────────
  return (
    <div
      className="card-hover glass rounded-3xl overflow-hidden group cursor-pointer animate-fade-up"
      style={{ animationDelay: delay }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-500/40 via-purple-400/20 to-transparent" />

      <div className="p-7">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Date + reading time */}
            <div className="flex items-center gap-3 mb-2.5 flex-wrap">
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{date}</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-gray-700 text-[10px]">{readingMin} min read</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-gray-700 text-[10px]">{wordCount} words</span>
              {mood && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="text-[11px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">{mood}</span>
                </>
              )}
            </div>
            {/* Title */}
            <h3 className="text-lg font-bold leading-snug group-hover:text-purple-300 transition-colors pr-4">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <p className={`text-gray-400 mt-4 text-sm leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-3'}`}>
          {content}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {tags.map((tag, i) => (
              <span key={i} className="text-[10px] text-gray-500 bg-gray-800/50 px-2.5 py-1 rounded-lg">#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800/60">
          <button
            onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="text-gray-600 hover:text-purple-400 text-xs font-medium transition-colors"
          >
            {isExpanded ? '↑ Show less' : '↓ Read more'}
          </button>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={e => { e.stopPropagation(); setIsEditing(true); }}
              className="bg-gray-800/80 hover:bg-purple-600/30 hover:text-purple-400 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >✏️ Edit</button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(id); }}
              className="bg-gray-800/80 hover:bg-red-600/20 hover:text-red-400 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >✕ Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalCard;