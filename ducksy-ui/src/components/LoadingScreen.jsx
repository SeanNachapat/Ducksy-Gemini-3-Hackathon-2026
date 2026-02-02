"use client"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function LoadingScreen({ isLoading }) {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-100 bg-[#0a0a0a] flex items-center justify-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-24 h-24 relative"
                    >
                        <Image
                            src="/ducksy-logo.svg"
                            alt="Loading..."
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
