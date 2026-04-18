import React, { useMemo } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────
const toDateStr = (d) => new Date(d).toLocaleDateString('en-CA'); // YYYY-MM-DD


// ── Activity Heatmap ──────────────────────────────────────────────────────
export function ActivityHeatmap({ entries }) {
  const weeks = 18; // last ~4 months
  const today = new Date();
  today.setHours(0,0,0,0);

  // Build date → count map
  const countMap = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      if (!e.date) return;
      const key = toDateStr(e.date);
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [entries]);

  // Build grid: weeks × 7 days
  const grid = useMemo(() => {
    const cells = [];
    // Start from Monday 'weeks' weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7) + 1);

    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key   = d.toLocaleDateString('en-CA');
      const count = countMap[key] || 0;
      const isToday = key === toDateStr(today);
      const isFuture = d > today;
      cells.push({ date: d, key, count, isToday, isFuture });
    }
    return cells;
  }, [countMap, today, weeks]);

  const maxCount = Math.max(...Object.values(countMap), 1);

  const getCellColor = (cell) => {
    if (cell.isFuture) return 'transparent';
    if (cell.count === 0) return 'rgba(255,255,255,0.04)';
    const intensity = cell.count / maxCount;
    if (intensity < 0.33) return 'rgba(124,58,237,0.3)';
    if (intensity < 0.66) return 'rgba(124,58,237,0.6)';
    return 'rgba(124,58,237,0.9)';
  };

  const months = [];
  grid.filter((_, i) => i % 7 === 0).forEach(cell => {
    const m = cell.date.toLocaleDateString('en-US', { month: 'short' });
    if(!months.length || months[months.length-1].label !== m)
      months.push({ label: m, col: Math.floor(grid.indexOf(cell) / 7) });
  });

  const totalActive = Object.keys(countMap).length;
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date(today);
    while (true) {
      const key = d.toLocaleDateString('en-CA');
      if (!countMap[key]) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [countMap, today]);

  return (
    <div className="glass rounded-3xl p-6 animate-fade-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-white font-bold text-base">Writing Activity</h3>
          <p className="text-gray-600 text-xs mt-0.5">{totalActive} active days · last 4 months</p>
        </div>
        <div className="flex gap-4">
          {streak > 0 && (
            <div className="text-right">
              <p className="text-orange-400 font-black text-xl">🔥 {streak}</p>
              <p className="text-gray-600 text-[10px]">day streak</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ position: 'relative', paddingTop: '18px' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0 }}>
            {months.map((m, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${m.col * 14}px`,
                fontSize: '9px', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {m.label}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 10px)`, gridTemplateRows: 'repeat(7, 10px)', gap: '3px' }}>
            {grid.map((cell, i) => (
              <div
                key={cell.key}
                title={cell.count > 0 ? `${cell.date.toLocaleDateString('en-US', { month:'short', day:'numeric' })}: ${cell.count} entr${cell.count===1?'y':'ies'}` : cell.date.toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                style={{
                  width: '10px', height: '10px',
                  borderRadius: '2px',
                  backgroundColor: getCellColor(cell),
                  gridRow: (i % 7) + 1,
                  gridColumn: Math.floor(i / 7) + 1,
                  outline: cell.isToday ? '1.5px solid rgba(124,58,237,0.8)' : 'none',
                  cursor: cell.count > 0 ? 'pointer' : 'default',
                  transition: 'transform 0.1s',
                }}
                onMouseEnter={e => { if(cell.count>0) e.target.style.transform='scale(1.4)'; }}
                onMouseLeave={e => { e.target.style.transform='scale(1)'; }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-gray-700 text-[10px]">Less</span>
        {['rgba(255,255,255,0.04)', 'rgba(124,58,237,0.3)', 'rgba(124,58,237,0.6)', 'rgba(124,58,237,0.9)'].map((c,i) => (
          <div key={i} style={{ width:10, height:10, borderRadius:2, backgroundColor:c }} />
        ))}
        <span className="text-gray-700 text-[10px]">More</span>
      </div>
    </div>
  );
}


// ── Search Bar ────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, resultCount, total }) {
  return (
    <div className="relative animate-fade-up">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search your entries..."
        className="w-full bg-[#0d1117] border border-gray-800 hover:border-gray-700 focus:border-purple-500/60 pl-11 pr-28 py-3 rounded-2xl text-white placeholder-gray-700 focus:outline-none transition-all text-sm"
      />
      {value && (
        <div className="absolute inset-y-0 right-4 flex items-center gap-3">
          <span className="text-gray-600 text-xs">{resultCount}/{total}</span>
          <button onClick={() => onChange('')} className="text-gray-600 hover:text-white transition-colors text-lg leading-none">×</button>
        </div>
      )}
    </div>
  );
}


// ── Export Button ─────────────────────────────────────────────────────────
export function ExportButton({ entries, username }) {
  const handleExport = () => {
    const lines = [
      `# ${username}'s Journal`,
      `Exported on ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`,
      `Total Entries: ${entries.length}`,
      '',
      '---',
      '',
      ...entries.flatMap(e => [
        `## ${e.title}`,
        `*Date: ${e.date ? new Date(e.date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) : 'Unknown'}*`,
        '',
        e.content || '',
        '',
        '---',
        '',
      ]),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${username}-journal-${new Date().toLocaleDateString('en-CA')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={entries.length === 0}
      className="flex items-center gap-2 glass text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
      title="Download your journal as a Markdown file"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export .md
    </button>
  );
}
