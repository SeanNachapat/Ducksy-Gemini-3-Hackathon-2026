"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"

import translations from "../../../locales/translations.json"

const languages = [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "th", name: "ไทย", flag: "🇹🇭" },
      { code: "ja", name: "日本語", flag: "🇯🇵" },
      { code: "zh", name: "中文", flag: "🇨🇳" },
]

const socialProviders = [
      {
            id: "github",
            icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
            ),
            bgClass: "bg-neutral-800 hover:bg-neutral-700",
            textClass: "text-white",
      },
      {
            id: "google",
            icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
            ),
            bgClass: "bg-white hover:bg-neutral-100",
            textClass: "text-neutral-800",
      },
      {
            id: "apple",
            icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
            ),
            bgClass: "bg-black hover:bg-neutral-900",
            textClass: "text-white",
      },
      {
            id: "discord",
            icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
            ),
            bgClass: "bg-[#5865F2] hover:bg-[#4752C4]",
            textClass: "text-white",
      },
]

export default function LoginPage() {
      const [lang, setLang] = useState("en")
      const [hoveredProvider, setHoveredProvider] = useState(null)
      const [isLoading, setIsLoading] = useState(null)
      const router = useRouter();

      const t = translations[lang]

      const handleSocialLogin = async (providerId) => {
            setIsLoading(providerId)
            await new Promise(resolve => setTimeout(resolve, 1500))
            console.log(`Login with ${providerId}`)
            setIsLoading(null)
            router.push("/dashboard")
      }

      return (
            <main className="min-h-screen bg-neutral-950 text-white overflow-hidden relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />

                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />

                  <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-amber-400/3 blur-[100px] rounded-full" />

                  <div className="fixed top-6 right-6 z-50">
                        <select
                              value={lang}
                              onChange={e => setLang(e.target.value)}
                              className="bg-neutral-900/80 backdrop-blur border border-neutral-800 text-neutral-300 
                     text-sm px-3 py-2 rounded-lg cursor-pointer outline-none
                     hover:border-neutral-700 transition-colors"
                        >
                              {languages.map(l => (
                                    <option key={l.code} value={l.code}>
                                          {l.flag} {l.name}
                                    </option>
                              ))}
                        </select>
                  </div>

                  <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-md px-6"
                  >
                        <div className="text-center mb-10">
                              <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className="mb-6 inline-block"
                              >
                                    <Image
                                          src="/ducksy-logo.svg"
                                          alt="Ducksy"
                                          width={80}
                                          height={80}
                                          className="drop-shadow-lg mx-auto"
                                    />
                              </motion.div>

                              <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-semibold text-white mb-2"
                              >
                                    {t.welcome}
                              </motion.h1>

                              <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-neutral-400"
                              >
                                    {t.authSubtitle}
                              </motion.p>
                        </div>

                        <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="space-y-3"
                        >
                              {socialProviders.map((provider, index) => (
                                    <motion.button
                                          key={provider.id}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.4 + index * 0.1 }}
                                          onClick={() => handleSocialLogin(provider.id)}
                                          onMouseEnter={() => setHoveredProvider(provider.id)}
                                          onMouseLeave={() => setHoveredProvider(null)}
                                          disabled={isLoading !== null}
                                          className={`
                w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl
                font-medium transition-all duration-300 relative overflow-hidden
                border border-transparent
                ${provider.bgClass} ${provider.textClass}
                ${isLoading === provider.id ? "opacity-70" : ""}
                ${hoveredProvider === provider.id ? "border-amber-400/30 scale-[1.02]" : ""}
                disabled:cursor-not-allowed
              `}
                                    >
                                          {isLoading === provider.id ? (
                                                <motion.div
                                                      animate={{ rotate: 360 }}
                                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                                />
                                          ) : (
                                                provider.icon
                                          )}
                                          <span>
                                                {t.continueWith} {provider.id}
                                          </span>

                                          {hoveredProvider === provider.id && (
                                                <motion.div
                                                      layoutId="hoverGlow"
                                                      className="absolute inset-0 bg-amber-400/5 pointer-events-none"
                                                      initial={{ opacity: 0 }}
                                                      animate={{ opacity: 1 }}
                                                      exit={{ opacity: 0 }}
                                                />
                                          )}
                                    </motion.button>
                              ))}
                        </motion.div>

                        <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1 }}
                              className="text-center text-neutral-500 text-xs mt-8 leading-relaxed"
                        >
                              {t.terms}{" "}
                              <a href="#" className="text-neutral-400 hover:text-amber-400 transition-colors underline underline-offset-2">
                                    {t.termsLink}
                              </a>{" "}
                              {t.and}{" "}
                              <a href="#" className="text-neutral-400 hover:text-amber-400 transition-colors underline underline-offset-2">
                                    {t.privacyLink}
                              </a>
                        </motion.p>
                  </motion.div>

                  <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
            </main>
      )
}