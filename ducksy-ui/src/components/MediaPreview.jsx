import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertCircle, Image, Loader2, Maximize2, X } from 'lucide-react';
import { useSettings } from "@/hooks/SettingsContext";

export default function MediaPreview({ fileId, filePath, mimeType, duration }) {
    const { t } = useSettings();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [dataUrl, setDataUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const audioRef = useRef(null);

    // Load file as base64 data URL
    useEffect(() => {
        const loadFile = async () => {
            if (!filePath || !mimeType) {
                setIsLoading(false);
                setError("Missing file path or type");
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const result = await window.electron.invoke('read-file-as-base64', {
                    filePath,
                    mimeType
                });

                if (result.success) {
                    setDataUrl(result.dataUrl);
                } else {
                    setError(result.error || "Failed to load file");
                }
            } catch (err) {
                console.error("Failed to load media file:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadFile();
    }, [filePath, mimeType]);

    // Loading state
    if (isLoading) {
        return (
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                <span className="text-sm text-neutral-400">Loading media...</span>
            </div>
        );
    }

    // Error state
    if (error || !dataUrl) {
        return (
            <div className="w-full bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">{error || "File not available"}</span>
            </div>
        );
    }

    // Image preview
    if (mimeType?.startsWith('image')) {
        return (
            <>
                <div
                    className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 relative group cursor-pointer"
                    onClick={() => setIsFullscreen(true)}
                >
                    <img
                        src={dataUrl}
                        alt="Session Capture"
                        className="w-full h-auto object-contain max-h-[300px]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Fullscreen modal */}
                {isFullscreen && (
                    <div
                        className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-8"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={dataUrl}
                            alt="Session Capture - Full"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </>
        );
    }

    // Audio/Video preview
    if (mimeType?.startsWith('audio') || mimeType?.startsWith('video')) {
        const togglePlay = () => {
            if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause();
                } else {
                    audioRef.current.play();
                }
                setIsPlaying(!isPlaying);
            }
        };

        const onTimeUpdate = () => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
            }
        };

        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleSeek = (e) => {
            if (audioRef.current && duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = x / rect.width;
                audioRef.current.currentTime = percent * duration;
            }
        };

        const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        return (
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center hover:bg-amber-400 transition-colors shrink-0 shadow-lg shadow-amber-500/20"
                >
                    {isPlaying ? (
                        <Pause className="w-5 h-5 text-black fill-black" strokeWidth={0} />
                    ) : (
                        <Play className="w-5 h-5 text-black fill-black ml-1" strokeWidth={0} />
                    )}
                </button>

                <div className="flex-1 space-y-2">
                    <div
                        className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-amber-500 transition-all duration-100 relative group-hover:bg-amber-400"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration || 0)}</span>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    src={dataUrl}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={onEnded}
                    className="hidden"
                />
            </div>
        );
    }

    return null;
}
