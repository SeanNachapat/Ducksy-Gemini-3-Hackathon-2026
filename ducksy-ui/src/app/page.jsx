"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const translations = {
  en: {
    subtitle: "Your AI-powered companion",
    getStarted: "Get Started",
    back: "Back",
    continue: "Continue",
    letsGo: "Let's Go!",
    step1Title: "Smart Assistance",
    step1Desc: "Navigate complex tasks with intelligent suggestions and real-time support.",
    step2Title: "Lightning Fast",
    step2Desc: "Instant responses powered by cutting-edge AI technology.",
    step3Title: "You're All Set!",
    step3Desc: "Ducksy is ready to assist you. Let's begin.",
    permissionTitle: "Permissions Required",
    permissionDesc: "Ducksy needs access to these features to work properly.",
    microphone: "Microphone",
    microphoneDesc: "For voice commands and audio input",
    screenShare: "Screen Recording",
    screenShareDesc: "To see and help with what's on your screen",
    grantAccess: "Grant Access",
    openSettings: "Open Settings",
    granted: "Granted",
    denied: "Denied",
    pending: "Click to allow",
    allGranted: "All permissions granted!",
  },
  th: {
    subtitle: "ผู้ช่วย AI ของคุณ",
    getStarted: "เริ่มต้นใช้งาน",
    back: "ย้อนกลับ",
    continue: "ถัดไป",
    letsGo: "เริ่มเลย!",
    step1Title: "ช่วยเหลืออัจฉริยะ",
    step1Desc: "นำทางงานซับซ้อนด้วยคำแนะนำอัจฉริยะและการสนับสนุนแบบเรียลไทม์",
    step2Title: "เร็วดั่งสายฟ้า",
    step2Desc: "ตอบสนองทันทีด้วยเทคโนโลยี AI ล้ำสมัย",
    step3Title: "พร้อมแล้ว!",
    step3Desc: "Ducksy พร้อมช่วยเหลือคุณแล้ว มาเริ่มกันเลย",
    permissionTitle: "ต้องการสิทธิ์การเข้าถึง",
    permissionDesc: "Ducksy ต้องการเข้าถึงฟีเจอร์เหล่านี้เพื่อทำงานได้อย่างเต็มประสิทธิภาพ",
    microphone: "ไมโครโฟน",
    microphoneDesc: "สำหรับคำสั่งเสียงและการป้อนเสียง",
    screenShare: "การบันทึกหน้าจอ",
    screenShareDesc: "เพื่อดูและช่วยเหลือสิ่งที่อยู่บนหน้าจอของคุณ",
    grantAccess: "ให้สิทธิ์",
    openSettings: "เปิดการตั้งค่า",
    granted: "อนุญาตแล้ว",
    denied: "ถูกปฏิเสธ",
    pending: "คลิกเพื่ออนุญาต",
    allGranted: "ได้รับสิทธิ์ทั้งหมดแล้ว!",
  },
  ja: {
    subtitle: "あなたのAIパートナー",
    getStarted: "始める",
    back: "戻る",
    continue: "次へ",
    letsGo: "始めましょう！",
    step1Title: "スマートアシスタント",
    step1Desc: "インテリジェントな提案とリアルタイムサポートで複雑なタスクをナビゲート",
    step2Title: "超高速",
    step2Desc: "最先端のAI技術による即座のレスポンス",
    step3Title: "準備完了！",
    step3Desc: "Ducksyがあなたをサポートする準備ができました",
    permissionTitle: "権限が必要です",
    permissionDesc: "Ducksyが正常に動作するには、これらの機能へのアクセスが必要です。",
    microphone: "マイク",
    microphoneDesc: "音声コマンドと音声入力用",
    screenShare: "画面録画",
    screenShareDesc: "画面上の内容を確認してサポートするため",
    grantAccess: "アクセスを許可",
    openSettings: "設定を開く",
    granted: "許可済み",
    denied: "拒否",
    pending: "クリックして許可",
    allGranted: "すべての権限が付与されました！",
  },
  zh: {
    subtitle: "您的AI助手",
    getStarted: "开始使用",
    back: "返回",
    continue: "继续",
    letsGo: "开始吧！",
    step1Title: "智能助手",
    step1Desc: "通过智能建议和实时支持导航复杂任务",
    step2Title: "闪电般快速",
    step2Desc: "尖端AI技术提供即时响应",
    step3Title: "准备就绪！",
    step3Desc: "Ducksy已准备好为您服务",
    permissionTitle: "需要权限",
    permissionDesc: "Ducksy需要访问这些功能才能正常工作。",
    microphone: "麦克风",
    microphoneDesc: "用于语音命令和音频输入",
    screenShare: "屏幕录制",
    screenShareDesc: "查看并帮助您屏幕上的内容",
    grantAccess: "授予访问权限",
    openSettings: "打开设置",
    granted: "已授权",
    denied: "已拒绝",
    pending: "点击允许",
    allGranted: "所有权限已授予！",
  },
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [lang, setLang] = useState("en")
  const [isElectron, setIsElectron] = useState(false)
  const [permissions, setPermissions] = useState({
    microphone: "unknown",
    screen: "unknown",
  })

  const t = translations[lang]

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

      // Initial permission check
      checkPermissionStatus()
    }
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
    window.electron?.send("onboarding-complete", { language: lang })
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
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />

      {/* Minimal accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />

      {/* Language selector */}
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

      {/* Progress indicator */}
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

      {/* Content */}
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
              <span className="text-4xl">🎯</span>
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
              <span className="text-4xl">⚡</span>
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

              {/* Screen Permission */}
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