import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Search, FileText, Lightbulb, Zap } from 'lucide-react';

const audioSteps = [
    { text: "Listening to data...", icon: Brain, color: "text-amber-500" },
    { text: "Processing speech...", icon: Zap, color: "text-yellow-400" },
    { text: "Analyzing context...", icon: Search, color: "text-blue-400" },
    { text: "Identifying speakers...", icon: Sparkles, color: "text-purple-400" },
    { text: "Extracting key points...", icon: FileText, color: "text-green-400" },
    { text: "Generating summary...", icon: Lightbulb, color: "text-amber-300" }
];

const imageSteps = [
    { text: "Scanning image...", icon: Search, color: "text-blue-400" },
    { text: "Analyzing visual tokens...", icon: Zap, color: "text-purple-400" },
    { text: "Extracting text...", icon: FileText, color: "text-green-400" },
    { text: "Identifying objects...", icon: Brain, color: "text-amber-500" },
    { text: "Understanding context...", icon: Sparkles, color: "text-yellow-400" },
    { text: "Generating description...", icon: Lightbulb, color: "text-amber-300" }
];

export default function ThinkingIndicator({ type = 'audio' }) {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = type === 'image' ? imageSteps : audioSteps;

    useEffect(() => {
        // Reset step when type changes
        setCurrentStep(0);
    }, [type]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length);
        }, 2500); // Change step every 2.5 seconds

        return () => clearInterval(interval);
    }, [steps.length]);

    const StepIcon = steps[currentStep]?.icon || Brain;
    const stepColor = steps[currentStep]?.color || "text-amber-500";
    const stepText = steps[currentStep]?.text || "Thinking...";

    return (
        <div className="flex flex-col items-center justify-center p-6 w-full">
            <div className="relative mb-6">
                {/* Pulsing background effect */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute inset-0 rounded-full blur-xl ${stepColor.replace('text-', 'bg-')}/30`}
                />

                <motion.div
                    key={currentStep}
                    initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 bg-neutral-900/80 p-4 rounded-full border border-white/10 backdrop-blur-md"
                >
                    <StepIcon className={`w-8 h-8 ${stepColor}`} />
                </motion.div>
            </div>

            <div className="h-8 relative w-full flex justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentStep}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm font-medium text-white absolute text-center"
                    >
                        {stepText}
                    </motion.p>
                </AnimatePresence>
            </div>

            <div className="flex gap-1 mt-2">
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-amber-500"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-amber-500"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-amber-500"
                />
            </div>

            <p className="text-[10px] text-neutral-500 mt-4 opacity-70">Gemini 3.0 Flash is thinking...</p>
        </div>
    );
}
