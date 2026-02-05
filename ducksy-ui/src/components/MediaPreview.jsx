import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';
import { useSettings } from "@/hooks/SettingsContext";

export default function MediaPreview({ fileId, filePath, type, duration, fileExists }) {
    const { t } = useSettings();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    // If file doesn't exist on disk, don't show preview
    if (!fileExists) {
        return null;
    }

    if (type.startsWith('image')) {
        return (
            <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/20">
                <img
                    src={`file://${filePath}`}
                    alt="Session Capture"
                    className="w-full h-auto object-contain max-h-[300px]"
                />
            </div>
        );
    }

    if (type.startsWith('audio') || type.startsWith('video') || type === 'summary') {
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

        const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        return (
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center hover:bg-amber-400 transition-colors shrink-0"
                >
                    {isPlaying ? (
                        <Pause className="w-5 h-5 text-black fill-black" strokeWidth={0} />
                    ) : (
                        <Play className="w-5 h-5 text-black fill-black ml-1" strokeWidth={0} />
                    )}
                </button>

                <div className="flex-1 space-y-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 transition-all duration-100"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration || 0)}</span>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    src={`file://${filePath}`}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={onEnded}
                    className="hidden"
                />
            </div>
        );
    }

    return null;
}
