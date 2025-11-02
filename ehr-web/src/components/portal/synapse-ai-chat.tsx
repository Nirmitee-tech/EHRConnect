'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SynapseAIChatProps {
  isOpen: boolean
  onClose: () => void
}

export function SynapseAIChat({ isOpen, onClose }: SynapseAIChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${session?.user?.name?.split(' ')[0] || 'there'}! I'm Synapse, your AI health assistant. I can help you with:

• Understanding your medical records
• Preparing for appointments
• Managing medications
• Health questions and concerns
• Navigating your patient portal

How can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response - Replace with actual AI integration
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(userMessage.content),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Starting a new conversation! I'm here to help with your health questions. What would you like to know?`,
        timestamp: new Date(),
      },
    ])
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Synapse AI</h2>
              <p className="text-xs text-white/80">Your Health Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-lg"
              onClick={handleNewChat}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-lg"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className={`w-8 h-8 flex-shrink-0 ${message.role === 'user' ? 'bg-gradient-to-br from-teal-500 to-cyan-500' : 'bg-gradient-to-br from-purple-600 to-indigo-600'}`}>
                  <AvatarFallback className="text-white text-sm font-medium">
                    {message.role === 'user' ? 'You' : <Sparkles className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div
                    className={`inline-block p-3 rounded-2xl max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600">
                  <AvatarFallback className="text-white">
                    <Sparkles className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="inline-block p-3 rounded-2xl rounded-tl-sm bg-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your health..."
                className="min-h-[44px] max-h-32 resize-none pr-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Synapse can make mistakes. Verify important medical information.
          </p>
        </div>
      </div>
    </>
  )
}

// Floating Action Button for AI
export function SynapseAIFAB({ onClick }: { onClick: () => void }) {
  const [isPulsing, setIsPulsing] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsPulsing(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 shadow-2xl shadow-purple-500/40 flex items-center justify-center hover:scale-110 transition-all duration-300 group ${isPulsing ? 'animate-pulse' : ''}`}
      aria-label="Open Synapse AI Assistant"
    >
      <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:rotate-12 transition-transform" />

      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full bg-purple-400 opacity-75 animate-ping" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600" />

      {/* Icon */}
      <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 group-hover:rotate-12 transition-transform" />
    </button>
  )
}

// Mock response generator - Replace with actual AI integration
function generateMockResponse(userInput: string): string {
  const lowerInput = userInput.toLowerCase()

  if (lowerInput.includes('appointment')) {
    return "I can help you with appointments! You can view your upcoming appointments in the Appointments section. Would you like me to show you your next scheduled appointment or help you book a new one?"
  }

  if (lowerInput.includes('medication') || lowerInput.includes('medicine')) {
    return "I'll help you with your medications. You can find your current medication list in the Health Records section. Would you like me to explain any specific medication or help you set up reminders?"
  }

  if (lowerInput.includes('test result') || lowerInput.includes('lab')) {
    return "Lab results and test reports are available in your Documents section. Recent test results are also visible on your dashboard. Would you like me to help you understand any specific test result?"
  }

  if (lowerInput.includes('doctor') || lowerInput.includes('provider')) {
    return "You can find information about your healthcare providers in your appointments section. Would you like me to help you send a message to your doctor or schedule an appointment?"
  }

  return "I understand you're asking about: " + userInput + "\n\nWhile I'm being set up to provide more detailed responses, I can currently help you navigate the patient portal, understand your health records, and answer general health questions. What specific information would you like to know?"
}
