'use client'
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDialog, useConfirmDialog, useAlertDialog } from "@/context/dialog";
const translations = {
      en: {
            dashboard: "Dashboard",
            greeting: "Hello",
            voiceRecord: "Voice",
            screenShare: "Share Screen",
            capture: "Capture",
            recording: "Recording...",
            sharing: "Sharing...",
            stopRecording: "Stop",
            stopSharing: "Stop Sharing",
            settings: "Settings",
            logout: "Log out",
            viewAll: "View All",
            quickActions: "Quick Actions",
            chatHistory: "Chat History",
            stats: "Your Stats",
            totalChats: "Total Chats",
            voiceQueries: "Voice Queries",
            screenShares: "Screen Shares",
            captures: "Captures",
            you: "You",
            ai: "Ducksy",
            noHistory: "No conversations yet",
            noHistoryDesc: "Start chatting with Ducksy!",
            today: "Today",
            yesterday: "Yesterday",
      },
      th: {
            dashboard: "แดชบอร์ด",
            greeting: "สวัสดี",
            voiceRecord: "เสียง",
            screenShare: "แชร์หน้าจอ",
            capture: "จับภาพ",
            recording: "กำลังบันทึก...",
            sharing: "กำลังแชร์...",
            stopRecording: "หยุด",
            stopSharing: "หยุดแชร์",
            settings: "ตั้งค่า",
            logout: "ออกจากระบบ",
            viewAll: "ดูทั้งหมด",
            quickActions: "การดำเนินการด่วน",
            chatHistory: "ประวัติการสนทนา",
            stats: "สถิติของคุณ",
            totalChats: "แชททั้งหมด",
            voiceQueries: "คำสั่งเสียง",
            screenShares: "แชร์หน้าจอ",
            captures: "จับภาพ",
            you: "คุณ",
            ai: "Ducksy",
            noHistory: "ยังไม่มีการสนทนา",
            noHistoryDesc: "เริ่มคุยกับ Ducksy เลย!",
            today: "วันนี้",
            yesterday: "เมื่อวาน",
      },
      ja: {
            dashboard: "ダッシュボード",
            greeting: "こんにちは",
            voiceRecord: "音声",
            screenShare: "画面共有",
            capture: "キャプチャ",
            recording: "録音中...",
            sharing: "共有中...",
            stopRecording: "停止",
            stopSharing: "共有を停止",
            settings: "設定",
            logout: "ログアウト",
            viewAll: "すべて表示",
            quickActions: "クイックアクション",
            chatHistory: "チャット履歴",
            stats: "統計",
            totalChats: "総チャット",
            voiceQueries: "音声クエリ",
            screenShares: "画面共有",
            captures: "キャプチャ",
            you: "あなた",
            ai: "Ducksy",
            noHistory: "会話履歴がありません",
            noHistoryDesc: "Ducksyと話し始めましょう！",
            today: "今日",
            yesterday: "昨日",
      },
      zh: {
            dashboard: "仪表板",
            greeting: "你好",
            voiceRecord: "语音",
            screenShare: "共享屏幕",
            capture: "截图",
            recording: "录制中...",
            sharing: "共享中...",
            stopRecording: "停止",
            stopSharing: "停止共享",
            settings: "设置",
            logout: "退出登录",
            viewAll: "查看全部",
            quickActions: "快捷操作",
            chatHistory: "聊天记录",
            stats: "统计",
            totalChats: "总聊天",
            voiceQueries: "语音查询",
            screenShares: "屏幕共享",
            captures: "截图",
            you: "你",
            ai: "Ducksy",
            noHistory: "暂无对话",
            noHistoryDesc: "开始与 Ducksy 聊天吧！",
            today: "今天",
            yesterday: "昨天",
      },
};

const languages = [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "th", name: "ไทย", flag: "🇹🇭" },
      { code: "ja", name: "日本語", flag: "🇯🇵" },
      { code: "zh", name: "中文", flag: "🇨🇳" },
];

const mockChatHistory = [
      {
            id: 1,
            timestamp: Date.now() - 1000 * 60 * 5,
            messages: [
                  { role: "user", content: "How do I create a React component?" },
                  { role: "ai", content: "To create a React component, you can use either a function or class. Here's a simple functional component example..." },
            ],
      },
      {
            id: 2,
            timestamp: Date.now() - 1000 * 60 * 30,
            messages: [
                  { role: "user", content: "What's the weather like today?" },
                  { role: "ai", content: "I don't have access to real-time weather data, but I can help you find weather information..." },
            ],
      },
      {
            id: 3,
            timestamp: Date.now() - 1000 * 60 * 60 * 2,
            messages: [
                  { role: "user", content: "Explain quantum computing in simple terms" },
                  { role: "ai", content: "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously, unlike classical bits..." },
            ],
      },
      {
            id: 4,
            timestamp: Date.now() - 1000 * 60 * 60 * 5,
            messages: [
                  { role: "user", content: "Write a poem about coding" },
                  { role: "ai", content: "In lines of code, we weave our dreams,\nWith logic pure and clever schemes..." },
            ],
      },
      {
            id: 5,
            timestamp: Date.now() - 1000 * 60 * 60 * 24,
            messages: [
                  { role: "user", content: "How to make pasta carbonara?" },
                  { role: "ai", content: "Classic Carbonara needs: spaghetti, guanciale, eggs, Pecorino Romano, and black pepper. Here's the method..." },
            ],
      },
      {
            id: 6,
            timestamp: Date.now() - 1000 * 60 * 60 * 25,
            messages: [
                  { role: "user", content: "Best practices for API design" },
                  { role: "ai", content: "Key REST API best practices include: use proper HTTP methods, meaningful status codes, versioning, and clear naming..." },
            ],
      },
];

const MicIcon = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
);

const ScreenIcon = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
);

const CameraIcon = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
);

const StopIcon = ({ className }) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
);

const SettingsIcon = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
);

const LogoutIcon = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
);

const ChatIcon = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
);

const ChevronIcon = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
);

const DuckLogo = ({ size = 40 }) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" fill="#FBBF24" />
            <ellipse cx="50" cy="55" rx="30" ry="25" fill="#FCD34D" />
            <circle cx="38" cy="42" r="6" fill="#1F2937" />
            <circle cx="62" cy="42" r="6" fill="#1F2937" />
            <circle cx="40" cy="40" r="2" fill="white" />
            <circle cx="64" cy="40" r="2" fill="white" />
            <ellipse cx="50" cy="55" rx="10" ry="6" fill="#F97316" />
      </svg>
);

const DuckAvatar = ({ size = 32 }) => (
      <div
            className="rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0"
            style={{ width: size, height: size }}
      >
            <span className="text-xs">🦆</span>
      </div>
);

export default function DashboardPage() {
      const [lang, setLang] = useState("en");
      const [isRecording, setIsRecording] = useState(false);
      const [isSharing, setIsSharing] = useState(false);
      const [recordingTime, setRecordingTime] = useState(0);
      const [sharingTime, setSharingTime] = useState(0);
      const [showUserMenu, setShowUserMenu] = useState(false);
      const [captureFlash, setCaptureFlash] = useState(false);
      const [selectedChat, setSelectedChat] = useState(null);
      const [selectDevice, setSelectDevice] = useState(null);

      const recordingIntervalRef = useRef(null);
      const sharingIntervalRef = useRef(null);

      const t = translations[lang];
      const { confirm } = useConfirmDialog();

      // ลบ useEffect ที่ watch isRecording ออก - ใช้ interval ใน recordAudio แทน

      useEffect(() => {
            if (isSharing) {
                  sharingIntervalRef.current = setInterval(() => {
                        setSharingTime((prev) => prev + 1);
                  }, 1000);
            } else {
                  if (sharingIntervalRef.current) clearInterval(sharingIntervalRef.current);
                  setSharingTime(0);
            }
            return () => {
                  if (sharingIntervalRef.current) clearInterval(sharingIntervalRef.current);
            };
      }, [isSharing]);

      // รับ control จาก onRecordingWindow
      useEffect(() => {
            if (!window.electron) return;

            window.electron.receive("recording-control-update", (data) => {
                  console.log("Recording control update:", data);
                  if (data.action === "stop") {
                        stopRecording();
                  } else if (data.action === "pause") {
                        pauseRecording();
                  }
            });

            return () => {
                  window.electron.removeAllListeners?.("recording-control-update");
            };
      }, []);

      // Cleanup on unmount
      useEffect(() => {
            return () => {
                  if (recordingIntervalRef.current) {
                        clearInterval(recordingIntervalRef.current);
                  }
                  if (sharingIntervalRef.current) {
                        clearInterval(sharingIntervalRef.current);
                  }
            };
      }, []);

      const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      };

      const formatTimestamp = (timestamp) => {
            const diff = Date.now() - timestamp;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours < 1) {
                  const mins = Math.floor(diff / (1000 * 60));
                  return `${mins}m ago`;
            } else if (hours < 24) {
                  return `${hours}h ago`;
            }
            return t.yesterday;
      };

      const handleCapture = () => {
            setCaptureFlash(true);
            setTimeout(() => setCaptureFlash(false), 200);
      };

      const startRecording = (deviceId) => {
            window.electron.send("record-audio", {
                  action: "start",
                  deviceId: deviceId
            });

            // Clear interval ก่อนเริ่มใหม่
            if (recordingIntervalRef.current) {
                  clearInterval(recordingIntervalRef.current);
            }

            // Reset เวลา
            setRecordingTime(0);

            // สร้าง interval ใหม่ - ใช้ตัวแปร local เพื่อส่ง IPC
            let currentTime = 0;
            recordingIntervalRef.current = setInterval(() => {
                  currentTime += 1;
                  setRecordingTime(currentTime);
                  window.electron.send("realtime-time-record", {
                        time: currentTime,
                        formatted: formatTime(currentTime)
                  });
            }, 1000);

            setIsRecording(true);
      };

      const stopRecording = () => {
            if (recordingIntervalRef.current) {
                  clearInterval(recordingIntervalRef.current);
                  recordingIntervalRef.current = null;
            }

            setRecordingTime(0);
            setIsRecording(false);

            window.electron.send("record-audio", {
                  action: "stop"
            });
      };

      const pauseRecording = () => {
            if (recordingIntervalRef.current) {
                  clearInterval(recordingIntervalRef.current);
                  recordingIntervalRef.current = null;
            }
            // ไม่ reset เวลา เพราะเป็น pause
      };

      const recordAudio = async () => {
            if (!isRecording) {
                  const devices = await window.electron.getMicrophoneDevices();
                  console.log("devices", devices);

                  let selectedDeviceId = devices[0]?.deviceId || null;

                  confirm({
                        title: "Record Audio",
                        message: "Are you sure you want to record audio?",
                        confirmText: "Yes",
                        cancelText: "No",
                        addons: (
                              <>
                                    <select
                                          className="px-4 py-2 w-full bg-neutral-800 text-white rounded-lg"
                                          onChange={(e) => { selectedDeviceId = e.target.value; }}
                                          defaultValue={selectedDeviceId}
                                    >
                                          {devices.map((device) => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                      {device.label}
                                                </option>
                                          ))}
                                    </select>
                              </>
                        ),
                        onConfirm: () => {
                              startRecording(selectedDeviceId);
                        }
                  });
            } else {
                  confirm({
                        title: "Stop Recording",
                        message: "Are you sure you want to stop recording?",
                        confirmText: "Yes",
                        cancelText: "No",
                        onConfirm: () => {
                              stopRecording();
                        }
                  });
            }
      };

      const stats = {
            total: mockChatHistory.length,
            voice: 3,
            screen: 2,
            capture: 4,
      };

      const todayChats = mockChatHistory.filter(
            (chat) => Date.now() - chat.timestamp < 1000 * 60 * 60 * 24
      );
      const yesterdayChats = mockChatHistory.filter(
            (chat) => Date.now() - chat.timestamp >= 1000 * 60 * 60 * 24
      );

      return (
            <div className="min-h-screen bg-neutral-950 text-white overflow-hidden relative">
                  <AnimatePresence>
                        {captureFlash && (
                              <motion.div
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-white z-50 pointer-events-none"
                              />
                        )}
                  </AnimatePresence>

                  <AnimatePresence>
                        {selectedChat && (
                              <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={() => setSelectedChat(null)}
                              >
                                    <motion.div
                                          initial={{ scale: 0.95, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          exit={{ scale: 0.95, opacity: 0 }}
                                          className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                                          onClick={(e) => e.stopPropagation()}
                                    >
                                          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                                                <h3 className="font-semibold text-white">{t.chatHistory}</h3>
                                                <button
                                                      onClick={() => setSelectedChat(null)}
                                                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                                                >
                                                      ✕
                                                </button>
                                          </div>
                                          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                                                {selectedChat.messages.map((msg, idx) => (
                                                      <div
                                                            key={idx}
                                                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                                      >
                                                            {msg.role === "user" ? (
                                                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                        U
                                                                  </div>
                                                            ) : (
                                                                  <DuckAvatar size={32} />
                                                            )}
                                                            <div
                                                                  className={`flex-1 max-w-[80%] p-3 rounded-2xl ${msg.role === "user"
                                                                        ? "bg-amber-500/20 text-amber-100 rounded-tr-sm"
                                                                        : "bg-neutral-800 text-neutral-200 rounded-tl-sm"
                                                                        }`}
                                                            >
                                                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    </motion.div>
                              </motion.div>
                        )}
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full" />

                  <header className="relative z-20 border-b border-neutral-800/50">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                    <DuckLogo size={40} />
                                    <span className="text-xl font-semibold text-amber-400">Ducksy</span>
                              </div>

                              <div className="flex items-center gap-3 sm:gap-4">
                                    <select
                                          value={lang}
                                          onChange={(e) => setLang(e.target.value)}
                                          className="bg-neutral-900/80 backdrop-blur border border-neutral-800 text-neutral-300 
                         text-sm px-2 sm:px-3 py-2 rounded-lg cursor-pointer outline-none
                         hover:border-neutral-700 transition-colors"
                                    >
                                          {languages.map((l) => (
                                                <option key={l.code} value={l.code}>
                                                      {l.flag} {l.name}
                                                </option>
                                          ))}
                                    </select>

                                    <div className="relative">
                                          <button
                                                onClick={() => setShowUserMenu(!showUserMenu)}
                                                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 
                           flex items-center justify-center text-neutral-900 font-semibold
                           hover:scale-105 transition-transform"
                                          >
                                                D
                                          </button>

                                          <AnimatePresence>
                                                {showUserMenu && (
                                                      <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute right-0 top-12 w-48 bg-neutral-900 border border-neutral-800 
                               rounded-xl shadow-xl overflow-hidden z-50"
                                                      >
                                                            <button className="w-full px-4 py-3 text-left text-neutral-300 hover:bg-neutral-800 
                                       transition-colors flex items-center gap-3">
                                                                  <SettingsIcon className="w-4 h-4" />
                                                                  {t.settings}
                                                            </button>
                                                            <button className="w-full px-4 py-3 text-left text-red-400 hover:bg-neutral-800 
                                       transition-colors flex items-center gap-3">
                                                                  <LogoutIcon className="w-4 h-4" />
                                                                  {t.logout}
                                                            </button>
                                                      </motion.div>
                                                )}
                                          </AnimatePresence>
                                    </div>
                              </div>
                        </div>
                  </header>

                  <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                        <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-6 sm:mb-8"
                        >
                              <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                                    {t.greeting}, <span className="text-amber-400">User</span> 👋
                              </h1>
                              <p className="text-neutral-400">{t.dashboard}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                                    <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.1 }}
                                          className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-4 sm:p-6"
                                    >
                                          <h2 className="text-lg font-semibold text-white mb-4">{t.quickActions}</h2>

                                          <div className="space-y-3">
                                                <motion.button
                                                      whileTap={{ scale: 0.98 }}
                                                      onClick={() => recordAudio()}
                                                      className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all
                             ${isRecording
                                                                  ? "bg-rose-500/20 border-rose-500/50"
                                                                  : "bg-neutral-800/50 border-neutral-700 hover:border-rose-500/50"}`}
                                                >
                                                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0
                                  ${isRecording ? "bg-rose-500" : "bg-rose-500/20"}`}>
                                                            {isRecording ? (
                                                                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                                                                        <StopIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                                  </motion.div>
                                                            ) : (
                                                                  <MicIcon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
                                                            )}
                                                      </div>
                                                      <div className="flex-1 text-left">
                                                            <div className="font-medium text-white text-sm sm:text-base">
                                                                  {isRecording ? t.recording : t.voiceRecord}
                                                            </div>
                                                            {isRecording && (
                                                                  <div className="text-rose-400 text-xs sm:text-sm font-mono">{formatTime(recordingTime)}</div>
                                                            )}
                                                      </div>
                                                      {isRecording && <span className="text-xs sm:text-sm text-rose-400">{t.stopRecording}</span>}
                                                </motion.button>

                                                <motion.button
                                                      whileTap={{ scale: 0.98 }}
                                                      onClick={() => setIsSharing(!isSharing)}
                                                      className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all
                             ${isSharing
                                                                  ? "bg-blue-500/20 border-blue-500/50"
                                                                  : "bg-neutral-800/50 border-neutral-700 hover:border-blue-500/50"}`}
                                                >
                                                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0
                                  ${isSharing ? "bg-blue-500" : "bg-blue-500/20"}`}>
                                                            {isSharing ? (
                                                                  <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                                                        <ScreenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                                  </motion.div>
                                                            ) : (
                                                                  <ScreenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                                                            )}
                                                      </div>
                                                      <div className="flex-1 text-left">
                                                            <div className="font-medium text-white text-sm sm:text-base">
                                                                  {isSharing ? t.sharing : t.screenShare}
                                                            </div>
                                                            {isSharing && (
                                                                  <div className="text-blue-400 text-xs sm:text-sm font-mono">{formatTime(sharingTime)}</div>
                                                            )}
                                                      </div>
                                                      {isSharing && <span className="text-xs sm:text-sm text-blue-400">{t.stopSharing}</span>}
                                                </motion.button>

                                                <motion.button
                                                      whileTap={{ scale: 0.95 }}
                                                      onClick={handleCapture}
                                                      className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all
                             bg-neutral-800/50 border-neutral-700 hover:border-emerald-500/50"
                                                >
                                                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                            <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                                                      </div>
                                                      <div className="flex-1 text-left">
                                                            <div className="font-medium text-white text-sm sm:text-base">{t.capture}</div>
                                                      </div>
                                                </motion.button>
                                          </div>
                                    </motion.div>

                                    <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.2 }}
                                          className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-4 sm:p-6"
                                    >
                                          <h2 className="text-lg font-semibold text-white mb-4">{t.stats}</h2>

                                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                                <div className="bg-neutral-800/50 rounded-xl p-3 sm:p-4 text-center">
                                                      <div className="text-xl sm:text-2xl font-bold text-amber-400">{stats.total}</div>
                                                      <div className="text-xs text-neutral-500">{t.totalChats}</div>
                                                </div>
                                                <div className="bg-neutral-800/50 rounded-xl p-3 sm:p-4 text-center">
                                                      <div className="text-xl sm:text-2xl font-bold text-rose-400">{stats.voice}</div>
                                                      <div className="text-xs text-neutral-500">{t.voiceQueries}</div>
                                                </div>
                                                <div className="bg-neutral-800/50 rounded-xl p-3 sm:p-4 text-center">
                                                      <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.screen}</div>
                                                      <div className="text-xs text-neutral-500">{t.screenShares}</div>
                                                </div>
                                                <div className="bg-neutral-800/50 rounded-xl p-3 sm:p-4 text-center">
                                                      <div className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.capture}</div>
                                                      <div className="text-xs text-neutral-500">{t.captures}</div>
                                                </div>
                                          </div>
                                    </motion.div>
                              </div>

                              <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="lg:col-span-2 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-4 sm:p-6"
                              >
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                          <div className="flex items-center gap-2">
                                                <ChatIcon className="w-5 h-5 text-amber-400" />
                                                <h2 className="text-lg font-semibold text-white">{t.chatHistory}</h2>
                                          </div>
                                          <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                                                {t.viewAll}
                                          </button>
                                    </div>

                                    <div className="space-y-4">
                                          {todayChats.length > 0 && (
                                                <div>
                                                      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                                                            {t.today}
                                                      </div>
                                                      <div className="space-y-2">
                                                            {todayChats.map((chat, index) => (
                                                                  <motion.div
                                                                        key={chat.id}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.1 * index }}
                                                                        onClick={() => setSelectedChat(chat)}
                                                                        className="flex items-start gap-3 p-3 sm:p-4 bg-neutral-800/30 rounded-xl
                                   hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                                                                  >
                                                                        <DuckAvatar size={36} />

                                                                        <div className="flex-1 min-w-0">
                                                                              <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-xs text-neutral-500">
                                                                                          {formatTimestamp(chat.timestamp)}
                                                                                    </span>
                                                                              </div>
                                                                              <p className="text-sm text-neutral-300 font-medium truncate">
                                                                                    {chat.messages[0].content}
                                                                              </p>
                                                                              <p className="text-xs text-neutral-500 truncate mt-1">
                                                                                    🦆 {chat.messages[1].content.slice(0, 60)}...
                                                                              </p>
                                                                        </div>

                                                                        <ChevronIcon className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors flex-shrink-0 mt-2" />
                                                                  </motion.div>
                                                            ))}
                                                      </div>
                                                </div>
                                          )}

                                          {yesterdayChats.length > 0 && (
                                                <div>
                                                      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 mt-4">
                                                            {t.yesterday}
                                                      </div>
                                                      <div className="space-y-2">
                                                            {yesterdayChats.map((chat, index) => (
                                                                  <motion.div
                                                                        key={chat.id}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.1 * (index + todayChats.length) }}
                                                                        onClick={() => setSelectedChat(chat)}
                                                                        className="flex items-start gap-3 p-3 sm:p-4 bg-neutral-800/30 rounded-xl
                                   hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                                                                  >
                                                                        <DuckAvatar size={36} />

                                                                        <div className="flex-1 min-w-0">
                                                                              <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-xs text-neutral-500">
                                                                                          {formatTimestamp(chat.timestamp)}
                                                                                    </span>
                                                                              </div>
                                                                              <p className="text-sm text-neutral-300 font-medium truncate">
                                                                                    {chat.messages[0].content}
                                                                              </p>
                                                                              <p className="text-xs text-neutral-500 truncate mt-1">
                                                                                    🦆 {chat.messages[1].content.slice(0, 60)}...
                                                                              </p>
                                                                        </div>

                                                                        <ChevronIcon className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors flex-shrink-0 mt-2" />
                                                                  </motion.div>
                                                            ))}
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                              </motion.div>
                        </div>
                  </div>

                  <AnimatePresence>
                        {(isRecording || isSharing) && (
                              <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40"
                              >
                                    <div
                                          className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-3 rounded-full backdrop-blur-xl
                          ${isRecording ? "bg-rose-500/20 border border-rose-500/30" : ""}
                          ${isSharing ? "bg-blue-500/20 border border-blue-500/30" : ""}`}
                                    >
                                          <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isRecording ? "bg-rose-500" : "bg-blue-500"}`}
                                          />
                                          <span className={`text-xs sm:text-sm font-medium ${isRecording ? "text-rose-400" : "text-blue-400"}`}>
                                                {isRecording ? t.recording : t.sharing}
                                          </span>
                                          <span className="text-white font-mono text-xs sm:text-sm">
                                                {formatTime(isRecording ? recordingTime : sharingTime)}
                                          </span>
                                    </div>
                              </motion.div>
                        )}
                  </AnimatePresence>
            </div>
      );
}