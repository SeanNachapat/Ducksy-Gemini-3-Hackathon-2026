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
            <div>
                  <h1>Check Status</h1>
            </div>
      )
}
