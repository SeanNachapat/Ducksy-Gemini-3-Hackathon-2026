import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from "@/hooks/SettingsContext";
export default function SessionChat({ fileId, initialHistory = [] }) {
    const { settings } = useSettings();
    const [history, setHistory] = useState(Array.isArray(initialHistory) ? initialHistory : []);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);
    useEffect(() => {
        setHistory(Array.isArray(initialHistory) ? initialHistory : []);
    }, [initialHistory]);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, loading]);
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setLoading(true);
        setError(null);
        setHistory(prev => [...prev, { role: 'user', content: userMsg, timestamp: Date.now() }]);
        if (window.electron) {
            try {
                const result = await window.electron.invoke('chat-session', { fileId, message: userMsg, settings });
                if (result.success) {
                    setHistory(result.history);
                } else {
                    setError(result.error || 'Failed to send message');
                }
            } catch (err) {
                setError('Communication error');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };
    return (
        <div className="flex flex-col h-full bg-neutral-900/50 rounded-xl border border-white/5 overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-white/5">
                <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    Session Assistant
                </h3>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px] custom-scrollbar"
            >
                {history.length === 0 && (
                    <div className="text-center text-neutral-500 text-sm py-8">
                        <p>Ask anything about this session context.</p>
                    </div>
                )}
                {history.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-amber-500/20' : 'bg-white/10'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-amber-500" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.role === 'user'
                            ? 'bg-amber-500 text-black rounded-tr-sm'
                            : 'bg-white/10 text-neutral-200 rounded-tl-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/10 text-neutral-200 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Thinking...</span>
                        </div>
                    </motion.div>
                )}
                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs justify-center p-2 bg-red-500/10 rounded-lg">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </div>
                )}
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-white/5 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
