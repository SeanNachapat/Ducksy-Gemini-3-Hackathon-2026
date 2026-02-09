import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, Calendar, X } from 'lucide-react';

const DashboardSearch = ({ onSelectSession }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };

        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);
        setIsOpen(true);
        try {
            if (window.electron) {
                const result = await window.electron.invoke('search-everything', { query: searchQuery });
                if (result.success) {
                    setResults(result.data);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(query);
        }
    };

    const handleSelectResult = async (result) => {
        if (onSelectSession && window.electron) {
            try {
                // Fetch full session details
                const sessionResult = await window.electron.invoke('get-session', { fileId: result.id });
                if (sessionResult.success) {
                    onSelectSession(sessionResult.data);
                    setIsOpen(false);
                    setQuery('');
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            }
        }
    };

    return (
        <div ref={containerRef} className="relative z-50">
            <div className={`relative flex items-center w-full md:w-80 h-10 rounded-full transition-all duration-300 border ${isFocused || isOpen ? 'bg-white/10 border-yellow-400/50' : 'bg-white/5 border-white/10'}`}>
                <div className="pl-3 text-neutral-400">
                    {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value === '') {
                            setResults([]);
                            setIsOpen(false);
                        }
                    }}
                    placeholder="Search logs, code, or memories..."
                    className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-white/40 px-3 font-sans h-full"
                    onFocus={() => {
                        setIsFocused(true);
                        if (query.trim()) setIsOpen(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    {!query && (
                        <div className="flex items-center justify-center px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[10px] text-neutral-400 font-mono">
                            <span className="text-xs mr-0.5">⌘</span>K
                        </div>
                    )}
                </div>
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 text-neutral-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && (results.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 w-full md:w-[400px] mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                        {results.length > 0 ? (
                            <>
                                <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                                    Results ({results.length})
                                </div>
                                {results.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelectResult(result)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors flex items-start gap-3 group"
                                    >
                                        <div className={`mt-0.5 p-2 rounded-lg ${result.type === 'debug' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-neutral-200 group-hover:text-white truncate">
                                                {result.title}
                                            </h4>
                                            <p className="text-xs text-neutral-500 mt-0.5 truncate">
                                                {result.summary || "No summary available"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-neutral-400 border border-white/5">
                                                    {new Date(result.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </>
                        ) : (
                            !isSearching && (
                                <div className="p-8 text-center text-neutral-500">
                                    <p className="text-sm">No results found for "{query}"</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardSearch;
