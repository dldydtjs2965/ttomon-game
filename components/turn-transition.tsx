"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, User, Bot } from "lucide-react"

interface TurnTransitionProps {
  isVisible: boolean
  isPlayerTurn: boolean
  turnCount: number
}

export function TurnTransition({ isVisible, isPlayerTurn, turnCount }: TurnTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="w-80">
              <CardContent className="p-8 text-center space-y-4">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <Clock className="w-16 h-16 mx-auto text-primary" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">턴 {turnCount}</h2>

                  <motion.div
                    className="flex items-center justify-center gap-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isPlayerTurn ? (
                      <>
                        <User className="w-6 h-6 text-blue-500" />
                        <span className="text-lg font-semibold text-blue-500">당신의 턴</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-6 h-6 text-red-500" />
                        <span className="text-lg font-semibold text-red-500">적의 턴</span>
                      </>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  className="w-full h-1 bg-muted rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
