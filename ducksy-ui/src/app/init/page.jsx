"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSettings } from "../../hooks/SettingsContext"
import translations from "../../locales/translations.json"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
]

export default function Home() {
  const { settings, updateSettings, t } = useSettings()
  const [currentStep, setCurrentStep] = useState(0)
  const [isElectron, setIsElectron] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialDb, setIsInitialDb] = useState(false)
  const [permissions, setPermissions] = useState({
    microphone: "unknown",
    screen: "unknown",
  })

  const router = useRouter();

  useEffect(() => {
    setIsElectron(!!window.electron)
    if (window.electron) {
      window.electron.receive("app-ready", () => {
        console.log("Electron app is ready")
        checkPermissionStatus()
      })

      window.electron.receive("permissions-result", (result) => {
        console.log("Permissions result:", result)
        setPermissions(result)
      })

      checkPermissionStatus()
    }

    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])


  const checkPermissionStatus = async () => {
    if (window.electron) {
      const status = await window.electron.invoke("check-permissions")
      if (status) {
        setPermissions(status)
      }
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      window.electron?.send("step-changed", { step: currentStep + 1 })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.electron?.send("step-changed", { step: currentStep - 1 })
    }
  }

  const handleFinish = () => {
    window.electron?.send("onboarding-complete", { language: settings.language })
    router.push("/dashboard")
  }

  const requestMicrophonePermission = async () => {
    if (window.electron) {
      const status = await window.electron.invoke("request-microphone")
      setPermissions(prev => ({ ...prev, microphone: status }))

      if (status === "denied") {
        window.electron.send("open-system-preferences", "microphone")
      }
    }
  }

  const requestScreenPermission = async () => {
    if (window.electron) {
      const status = await window.electron.invoke("request-screen")
      setPermissions(prev => ({ ...prev, screen: status }))

      if (status === "denied" || status === "restricted") {
        window.electron.send("open-system-preferences", "screen")
      }
    }
  }

  const allPermissionsGranted = permissions.microphone === "granted" && permissions.screen === "granted"

  const slideVariants = {
    enter: direction => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: direction => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "granted": return "text-emerald-400"
      case "denied": return "text-red-400"
      case "restricted": return "text-red-400"
      default: return "text-neutral-400"
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case "granted": return "bg-emerald-400/10 border-emerald-400/30"
      case "denied": return "bg-red-400/10 border-red-400/30"
      case "restricted": return "bg-red-400/10 border-red-400/30"
      default: return "bg-neutral-800/50 border-neutral-700"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "granted": return t.granted
      case "denied": return t.denied
      case "restricted": return t.denied
      default: return t.pending
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <RandomFloatingOrb
          className="absolute -top-[10%] -left-[5%] w-[600px] h-[600px] bg-amber-500/40 rounded-full blur-[120px]"
          pulse={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.6, 0.8],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          duration={10}
        />
        <RandomFloatingOrb
          className="absolute top-[20%] -right-[5%] w-[550px] h-[550px] bg-yellow-500/40 rounded-full blur-[110px]"
          pulse={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0.5, 0.7],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          duration={12}
          delay={1}
        />
        <RandomFloatingOrb
          className="absolute -bottom-[10%] left-[20%] w-[700px] h-[700px] bg-orange-600/40 rounded-full blur-[140px]"
          pulse={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.5, 0.7],
          }}
          duration={15}
          delay={2}
        />
      </div>



      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="fixed top-6 left-6 z-50">
        <select
          value={settings?.language || 'en'}
          onChange={e => updateSettings({ language: e.target.value })}
          className="bg-neutral-900/80 backdrop-blur border border-neutral-800 text-neutral-300 
                     text-sm px-3 py-2 rounded-lg cursor-pointer outline-none
                     hover:border-neutral-700 transition-colors appearance-none pr-8"
          style={{ backgroundImage: 'none' }}
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-xs">
          ▼
        </div>
      </div>

      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${i === currentStep
              ? "w-8 bg-amber-400"
              : i < currentStep
                ? "w-2 bg-amber-400/60"
                : "w-2 bg-neutral-700"
              }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={currentStep}>
        {currentStep === 0 && (
          <motion.div
            key="welcome"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={1}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center min-h-screen gap-6 relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Image
                src="/ducksy-logo.svg"
                alt="Ducksy"
                width={140}
                height={140}
                className="drop-shadow-lg"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-semibold text-amber-400"
            >
              Ducksy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-400 text-lg"
            >
              {t.subtitle}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={nextStep}
              className="mt-6 px-8 py-3 bg-amber-400 text-neutral-900 font-medium rounded-full
                         hover:bg-amber-300 transition-colors"
            >
              {t.getStarted}
            </motion.button>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={1}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center min-h-screen gap-5 px-8 relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 bg-amber-400/10 rounded-2xl flex items-center justify-center"
            >
              <span className="text-4xl">🧠</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-semibold text-white"
            >
              {t.step1Title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-400 text-center max-w-sm"
            >
              {t.step1Desc}
            </motion.p>

            <NavButtons t={t} onPrev={prevStep} onNext={nextStep} showPrev />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={1}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center min-h-screen gap-5 px-8 relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 bg-emerald-400/10 rounded-2xl flex items-center justify-center"
            >
              <span className="text-4xl">👁️</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-semibold text-white"
            >
              {t.step2Title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-400 text-center max-w-sm"
            >
              {t.step2Desc}
            </motion.p>

            <NavButtons t={t} onPrev={prevStep} onNext={nextStep} showPrev />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={1}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center min-h-screen gap-5 px-8 relative z-10"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-semibold text-white text-center"
            >
              {t.permissionTitle}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-400 text-center max-w-sm"
            >
              {t.permissionDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-4 w-full max-w-md mt-4"
            >
              <button
                onClick={requestMicrophonePermission}
                disabled={permissions.microphone === "granted"}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                           ${getStatusBg(permissions.microphone)}
                           ${permissions.microphone !== "granted" ? "hover:border-amber-400/50 cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{t.microphone}</div>
                  <div className="text-sm text-neutral-500">{t.microphoneDesc}</div>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(permissions.microphone)}`}>
                  {permissions.microphone === "granted"}{getStatusText(permissions.microphone)}
                </div>
              </button>

              <button
                onClick={requestScreenPermission}
                disabled={permissions.screen === "granted"}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                           ${getStatusBg(permissions.screen)}
                           ${permissions.screen !== "granted" ? "hover:border-amber-400/50 cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{t.screenShare}</div>
                  <div className="text-sm text-neutral-500">{t.screenShareDesc}</div>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(permissions.screen)}`}>
                  {permissions.screen === "granted"}{getStatusText(permissions.screen)}
                </div>
              </button>
            </motion.div>

            {allPermissionsGranted && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-emerald-400 text-sm mt-2"
              >
                {t.allGranted}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 mt-4"
            >
              <button
                onClick={prevStep}
                className="px-6 py-2.5 border border-neutral-700 text-neutral-300 rounded-full
                           hover:bg-neutral-800 transition-colors"
              >
                {t.back}
              </button>
              <button
                onClick={nextStep}
                disabled={!allPermissionsGranted}
                className={`px-8 py-2.5 font-medium rounded-full transition-colors
                           ${allPermissionsGranted
                    ? "bg-amber-400 text-neutral-900 hover:bg-amber-300"
                    : "bg-neutral-700 text-neutral-500 cursor-not-allowed"}`}
              >
                {t.continue}
              </button>
            </motion.div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={1}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center min-h-screen gap-5 px-8 relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 bg-amber-400/10 rounded-2xl flex items-center justify-center"
            >
              <span className="text-4xl">🚀</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-semibold text-white"
            >
              {t.step3Title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-400 text-center max-w-sm"
            >
              {t.step3Desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3 mt-4"
            >
              <button
                onClick={prevStep}
                className="px-6 py-2.5 border border-neutral-700 text-neutral-300 rounded-full
                           hover:bg-neutral-800 transition-colors"
              >
                {t.back}
              </button>
              <button
                onClick={handleFinish}
                className="px-8 py-2.5 bg-amber-400 text-neutral-900 font-medium rounded-full
                           hover:bg-amber-300 transition-colors"
              >
                {t.letsGo}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isElectron && (
        <div className="fixed bottom-4 left-4 text-xs text-neutral-600">
          Running in Electron
        </div>
      )}

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
    </main>
  )
}

function NavButtons({ t, onPrev, onNext, showPrev }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex gap-3 mt-6"
    >
      {showPrev && (
        <button
          onClick={onPrev}
          className="px-6 py-2.5 border border-neutral-700 text-neutral-300 rounded-full
                     hover:bg-neutral-800 transition-colors"
        >
          {t.back}
        </button>
      )}
      <button
        onClick={onNext}
        className="px-8 py-2.5 bg-amber-400 text-neutral-900 font-medium rounded-full
                   hover:bg-amber-300 transition-colors"
      >
        {t.continue}
      </button>
    </motion.div>
  )
}

function RandomFloatingOrb({ className, pulse, duration, delay = 0 }) {
  const [target, setTarget] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setTarget(getRandomPos())
  }, [])

  return (
    <motion.div
      animate={target}
      transition={{
        duration: 5,
        ease: "easeInOut",
      }}
      onAnimationComplete={() => {
        setTarget(getRandomPos())
      }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <motion.div
        animate={pulse}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        }}
        className={className}
      />
    </motion.div>
  )
}

function getRandomPos() {
  const range = 500
  return {
    x: Math.random() * range * 2 - range,
    y: Math.random() * range * 2 - range,
  }
}
