"use client"

import { forwardRef, useState } from "react"
import { Button } from "./button"
import type { ButtonProps } from "./button"

interface HearthstoneButtonProps extends ButtonProps {
  shine?: boolean
  glowColor?: string
}

const HearthstoneButton = forwardRef<HTMLButtonElement, HearthstoneButtonProps>(
  ({ children, className = "", shine = true, glowColor = "#FFD700", ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <Button
        ref={ref}
        className={`
          relative overflow-hidden transition-all duration-300
          ${isHovered ? "transform scale-105 shadow-xl" : ""}
          ${className}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* 버튼 내용 */}
        <div className="relative z-10">
          {children}
        </div>

        {/* 글래스모피즘 배경 */}
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
            backdropFilter: "blur(8px)"
          }}
        />

        {/* 호버 글로우 */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-md opacity-60"
            style={{
              boxShadow: `inset 0 0 20px ${glowColor}, 0 0 20px ${glowColor}`,
              background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`
            }}
          />
        )}

        {/* 샤인 효과 */}
        {shine && isHovered && (
          <div
            className="absolute inset-0 rounded-md pointer-events-none"
            style={{
              background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)`,
              transform: "translateX(-100%)",
              animation: "shine 0.6s ease-out"
            }}
          />
        )}

        {/* 하이라이트 */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-md"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)"
          }}
        />

        <style jsx>{`
          @keyframes shine {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
        `}</style>
      </Button>
    )
  }
)

HearthstoneButton.displayName = "HearthstoneButton"

export { HearthstoneButton }