'use client'

const Capture = () => {

      

      return <>
            <button className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform text-neutral-400 group-hover:text-white">
                        <Camera className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">{t.capture}</span>
            </button>
      </>
}

export default Capture;