'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function App() {
      const router = useRouter()
      useEffect(() => {
            if (window.electron) {
                  window.electron.invoke("isInitial").then((result) => {
                        if (!result) {
                              router.push("/init")
                        } else {
                              router.push("/dashboard")
                        }
                  })
            }
      }, [])
      return (
            <div className="flex h-screen w-full items-center justify-center bg-transparent">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
            </div>
      )
}
