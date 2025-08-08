"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon } from 'lucide-react'

export default function HexagonLoader({ size = 80, className = "" }: { size?: number; className?: string }) {
    const strokeWidth = 8
    const outerRadius = (size - strokeWidth) / 2
    const innerRadius = size / 5

    // Generate hexagon path - memoized for performance
    const createHexagonPath = (radius: number, centerX: number, centerY: number) => {
        const points = []
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)
            points.push(`${x},${y}`)
        }
        return `M ${points.join(' L ')} Z`
    }

    const center = size / 2
    const outerPath = createHexagonPath(outerRadius, center, center)
    const innerPath = createHexagonPath(innerRadius, center, center)

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <div className="relative">
                {/* Optimized background glow */}
                <div className="absolute inset-0 rounded-full opacity-20 dark:opacity-30 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-blue-500/30 blur-[10px] animate-pulse" />

                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="relative z-10"
                >
                    <defs>
                        <filter id={`glow-${size}`}>
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Outer hexagon with theme-aware contrast */}
                    <path
                        d={outerPath}
                        fill="none"
                        className="stroke-slate-900 dark:stroke-white transition-colors duration-300"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#glow-${size})`}
                        style={{
                            transformOrigin: 'center',
                            animation: 'hexagonMorph 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite'
                        }}
                    />

                    {/* Inner hexagon with theme-aware colors */}
                    <path
                        d={innerPath}
                        className="fill-blue-600 dark:fill-blue-400 transition-colors duration-300"
                        filter={`url(#glow-${size})`}
                        style={{
                            transformOrigin: 'center',
                            animation: 'innerHexagonForm 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.8s both'
                        }}
                    />
                </svg>
            </div>

            <style jsx>{`
        @keyframes hexagonMorph {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
            stroke-width: 2;
          }
          30% {
            opacity: 0.6;
            transform: scale(0.3) rotate(60deg);
            stroke-width: 12;
          }
          60% {
            opacity: 0.9;
            transform: scale(0.8) rotate(120deg);
            stroke-width: 8;
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
            stroke-width: ${strokeWidth};
          }
        }
        
        @keyframes innerHexagonForm {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
            filter: blur(10px);
          }
          40% {
            opacity: 0.3;
            transform: scale(0.2) rotate(-90deg);
            filter: blur(5px);
          }
          70% {
            opacity: 0.7;
            transform: scale(0.6) rotate(-30deg);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }
      `}</style>
        </div>
    )
}



// Main Demo Component
// export default function Component() {
//     const [isLoading, setIsLoading] = useState(false)

//     const handleStartLoading = () => {
//         setIsLoading(true)
//         setTimeout(() => setIsLoading(false), 3000)
//     }

//     return (
//         <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 transition-colors duration-300 flex items-center justify-center p-4">
//             <Card className="w-full max-w-md bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-colors duration-300">
//                 <CardHeader className="text-center">
//                     <div className="flex items-center justify-between mb-2">
//                         <CardTitle className="text-slate-900 dark:text-white transition-colors duration-300">
//                             Next-Themes Hexagon Loader
//                         </CardTitle>
//                     </div>
//                     <CardDescription className="text-slate-600 dark:text-slate-300 transition-colors duration-300">
//                         Optimized with next-themes integration
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-8">
//                     {/* Different sizes showcase */}
//                     <div className="space-y-6">
//                         <div className="text-center">
//                             <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 transition-colors duration-300">
//                                 Different Sizes
//                             </h3>
//                             <div className="flex items-center justify-center gap-6">
//                                 <HexagonLoader size={40} />
//                                 <HexagonLoader size={60} />
//                                 <HexagonLoader size={80} />
//                                 <HexagonLoader size={100} />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Interactive demo */}
//                     <div className="text-center space-y-4">
//                         <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">
//                             Interactive Demo
//                         </h3>
//                         {isLoading ? (
//                             <div className="py-8">
//                                 <HexagonLoader size={80} className="mb-4" />
//                                 <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
//                                     Loading...
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="py-8">
//                                 <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 flex items-center justify-center backdrop-blur-sm transition-colors duration-300">
//                                     <svg className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                     </svg>
//                                 </div>
//                                 <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
//                                     System Ready
//                                 </p>
//                             </div>
//                         )}

//                         <Button
//                             onClick={handleStartLoading}
//                             disabled={isLoading}
//                             className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-0 transition-colors duration-300"
//                         >
//                             {isLoading ? 'Processing...' : 'Initialize Loading Sequence'}
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     )
// }
