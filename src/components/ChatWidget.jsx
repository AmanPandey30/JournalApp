import React, { useState } from 'react';
import api from '../api/api';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hi! I am your Journal AI. Ask me about your past entries!", isAi: true }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(p => [...p, { text: userMsg, isAi: false }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { question: userMsg });
      setMessages(p => [...p, { text: res.data.answer, isAi: true }]);
    } catch (err) {
      setMessages(p => [...p, { text: "Sorry, I couldn't connect to my AI brain.", isAi: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="glass rounded-3xl w-[320px] h-[450px] flex flex-col overflow-hidden shadow-2xl shadow-purple-900/50 border border-purple-500/20 animate-fade-up">
          {/* Header */}
          <div className="bg-purple-600/20 p-4 border-b border-purple-500/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="font-bold text-sm text-purple-100">AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white px-2">✕</button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isAi ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] text-sm p-3 rounded-2xl ${m.isAi ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-purple-600 text-white rounded-tr-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-400 text-xs p-3 rounded-2xl rounded-tl-none animate-pulse">Thinking...</div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-800 bg-[#080b12]">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your journals..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-900/50 transition-transform hover:scale-110 animate-fade-up"
        >
          🤖
        </button>
      )}
    </div>
  );
}
