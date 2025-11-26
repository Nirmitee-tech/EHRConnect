'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  X, Send, Plus, User, Loader2, Activity, Brain, Sparkles, FileText, Pill, Calendar,
  Paperclip, Image as ImageIcon, Mic, ChevronDown, ChevronUp, Minimize2, Maximize2,
  Clock, Trash2, Download, Check, AlertCircle, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'

const suggestedPrompts = [
  { icon: FileText, text: 'Explain my recent lab results' },
  { icon: Pill, text: 'What are my current medications?' },
  { icon: Calendar, text: 'When is my next appointment?' },
  { icon: Activity, text: 'Show my vital signs trends' },
]

const agents = [
  { id: 'general', name: 'General Health', icon: Brain, color: 'from-emerald-500 to-teal-600', description: 'General medical questions and health information' },
  { id: 'lab', name: 'Lab Specialist', icon: FileText, color: 'from-blue-500 to-indigo-600', description: 'Lab results and diagnostic tests' },
  { id: 'medication', name: 'Pharmacist', icon: Pill, color: 'from-purple-500 to-pink-600', description: 'Medication information and interactions' },
  { id: 'wellness', name: 'Wellness Coach', icon: Activity, color: 'from-green-500 to-emerald-600', description: 'Lifestyle, nutrition, and preventive care' },
]

// Helper function to render markdown-style tables
const renderTable = (content: string) => {
  const tableRegex = /\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g
  const parts: Array<string | React.ReactElement> = []
  let lastIndex = 0
  let match

  while ((match = tableRegex.exec(content)) !== null) {
    // Add text before table
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }

    const headers = match[1].split('|').map(h => h.trim()).filter(h => h)
    const rows = match[2].trim().split('\n').map(row =>
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    )

    parts.push(
      <div className="my-4 overflow-x-auto" key={match.index}>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-emerald-50">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-sm text-gray-800 border-b border-gray-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts.length > 0 ? parts : content
}

// Helper function to render citations
const renderWithCitations = (content: string) => {
  // Match [1], [2], etc. for citations
  const citationRegex = /\[(\d+)\]/g
  return content.split(citationRegex).map((part, i) => {
    if (i % 2 === 1) {
      return (
        <sup key={i} className="text-emerald-600 font-semibold cursor-pointer hover:underline">
          [{part}]
        </sup>
      )
    }
    return part
  })
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: {
    name: string
    type: string
    size: number
    url?: string
  }[]
  citations?: {
    id: number
    text: string
    source: string
  }[]
}

interface SynapseAIChatProps {
  isOpen: boolean
  onClose: () => void
}

export function SynapseAIChat({ isOpen, onClose }: SynapseAIChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('general')
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Voice input functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        // In production, send to speech-to-text API
        // For now, simulate transcription
        setInputValue('Sample transcribed text from voice input')
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Text-to-speech function
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      speechSynthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSend = async () => {
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim() || 'Attached files',
      timestamp: new Date(),
      attachments: attachments.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setAttachments([])
    setIsLoading(true)

    // Simulate AI response - Replace with actual AI integration
    setTimeout(() => {
      const response = generateMockResponse(userMessage.content, userMessage.attachments, selectedAgent, setMessages)
      // Auto-speak response if voice mode
      if (response && isSpeaking) {
        speakResponse(response)
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestedPrompt = (text: string) => {
    setInputValue(text)
    setTimeout(() => handleSend(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        content: `Starting a new conversation! How can I help you with your health today?`,
        timestamp: new Date(),
      },
    ])
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Chat Panel - Clean Claude/ChatGPT Style */}
      <div className="fixed inset-y-0 right-0 w-full lg:w-[680px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header - Clean & Minimal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agents.find(a => a.id === selectedAgent)?.color} flex items-center justify-center cursor-pointer`}
              onClick={() => setShowAgentSelector(!showAgentSelector)}
            >
              {React.createElement(agents.find(a => a.id === selectedAgent)?.icon || Brain, { className: 'w-4.5 h-4.5 text-white' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">{agents.find(a => a.id === selectedAgent)?.name}</h2>
                <button
                  onClick={() => setShowAgentSelector(!showAgentSelector)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">{agents.find(a => a.id === selectedAgent)?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors text-emerald-600"
                onClick={stopSpeaking}
                title="Stop speaking"
              >
                <Activity className="w-4.5 h-4.5 animate-pulse" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={handleNewChat}
              title="New conversation"
            >
              <Plus className="w-4.5 h-4.5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
              title="Close"
            >
              <X className="w-4.5 h-4.5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Agent Selector Dropdown */}
        {showAgentSelector && (
          <div className="absolute top-16 left-6 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 w-80">
            <p className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Select Agent</p>
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent.id)
                  setShowAgentSelector(false)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group ${
                  selectedAgent === agent.id ? 'bg-emerald-50 border border-emerald-200' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    {React.createElement(agent.icon, { className: 'w-5 h-5 text-white' })}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.description}</p>
                  </div>
                  {selectedAgent === agent.id && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Messages Area - Clean Claude/ChatGPT Style */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 bg-white">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 pb-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg">
                <Brain className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">How can I help you today?</h3>
              <p className="text-sm text-gray-600 text-center mb-8 max-w-md">
                I'm your AI health assistant with access to medical data, clinical guidelines, and health information.
              </p>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <prompt.icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium leading-relaxed">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8">
              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`group mb-8 ${message.role === 'assistant' ? 'bg-gray-50/50' : ''} ${message.role === 'assistant' ? '-mx-6 px-6 py-6' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4.5 h-4.5 text-white" />
                      ) : (
                        <Brain className="w-4.5 h-4.5 text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {message.role === 'user' ? 'You' : 'Synapse'}
                        </span>
                      </div>

                      {/* Attachments Display */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {message.attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm">
                              <Paperclip className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-700">{att.name}</span>
                              <span className="text-gray-500 text-xs">({(att.size / 1024).toFixed(1)}KB)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Text with Tables and Citations */}
                      <div className="text-[15px] text-gray-800 leading-relaxed prose prose-sm max-w-none">
                        {typeof renderTable(message.content) === 'string'
                          ? renderWithCitations(message.content)
                          : renderTable(message.content)}
                      </div>

                      {/* Citations Section */}
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">References:</p>
                          <div className="space-y-1.5">
                            {message.citations.map((citation) => (
                              <div key={citation.id} className="text-xs text-gray-600">
                                <span className="font-semibold text-emerald-600">[{citation.id}]</span>{' '}
                                {citation.text} - <span className="italic">{citation.source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="group mb-8 bg-gray-50/50 -mx-6 px-6 py-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">Synapse</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area - Clean ChatGPT Style with File Upload */}
        <div className="border-t border-gray-100 bg-white px-6 py-4">
          {/* File Upload Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="max-w-3xl mx-auto">
            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-700">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="p-0.5 hover:bg-emerald-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Container */}
            <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <div className="flex items-end gap-1 ml-2 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file (PDF, images, documents)"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors ${
                    isRecording ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-emerald-600'
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  title={isRecording ? "Stop recording" : "Voice input"}
                >
                  <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                </Button>
              </div>

              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Synapse..."
                className="flex-1 min-h-[52px] max-h-32 resize-none px-2 py-4 text-[15px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                disabled={isLoading || isRecording}
              />

              <Button
                onClick={handleSend}
                disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
                className="m-2 h-9 w-9 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 transition-all flex-shrink-0"
                size="icon"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                Synapse can make mistakes. Verify with your provider.
              </p>
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakResponse(messages[messages.length - 1]?.content || '')}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {isSpeaking ? (
                  <>
                    <Activity className="w-3 h-3 animate-pulse" />
                    Speaking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Voice mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Floating Action Button - Modern Style
export function SynapseAIFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-30 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-emerald-200"
      aria-label="Open Synapse AI Assistant"
    >
      {/* Icon */}
      <Brain className="w-6 h-6 text-white" />

      {/* Sparkle effect */}
      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
    </button>
  )
}

// Mock response generator - Replace with actual AI integration
function generateMockResponse(
  userInput: string,
  attachments: { name: string; type: string; size: number }[] | undefined,
  agentId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
): string {
  const lowerInput = userInput.toLowerCase()

  // Handle file uploads
  if (attachments && attachments.length > 0) {
    const fileTypes = attachments.map(a => {
      if (a.type.includes('pdf')) return 'PDF document'
      if (a.type.includes('image')) return 'medical image'
      if (a.type.includes('doc')) return 'document'
      return 'file'
    }).join(', ')

    const content = `I've received your ${fileTypes}. Let me analyze this for you.

**Analysis:**

I can see you've uploaded medical documents. Here's what I can help with:

📄 **Document Review:**
• Lab results interpretation
• Medication lists analysis
• Imaging reports explanation
• Medical history review

🔍 **What I Notice:**
Based on the file type, this appears to be medical documentation. I can help you understand:
• Key findings and their significance
• Normal vs abnormal values
• Next steps and recommendations
• Questions to ask your provider

Would you like me to explain any specific part of these documents? Feel free to ask about particular values, terms, or sections you'd like clarified.

💡 **Tip:** For the most accurate analysis, you can also tell me what specific questions you have about these documents.`

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }])
    return content
  }

  if (lowerInput.includes('lab') || lowerInput.includes('test result') || lowerInput.includes('blood')) {
    const response = {
      content: `I'll help you understand your lab results. Here's a comprehensive breakdown of common blood tests:

**Complete Blood Count (CBC)**

| Test | Normal Range | What It Measures |
|------|--------------|------------------|
| WBC | 4,500-11,000/μL | Infection & immune response [1] |
| RBC | 4.5-5.5 million/μL (M), 4.0-5.0 (F) | Oxygen-carrying capacity [1] |
| Hemoglobin | 14-18 g/dL (M), 12-16 (F) | Oxygen in blood [2] |
| Hematocrit | 40-52% (M), 36-48% (F) | Red blood cell volume |
| Platelets | 150,000-400,000/μL | Blood clotting ability [3] |

**Metabolic Panel**

| Test | Normal Range | Indication |
|------|--------------|------------|
| Glucose | 70-100 mg/dL (fasting) | Diabetes screening [4] |
| BUN | 7-20 mg/dL | Kidney function |
| Creatinine | 0.7-1.3 mg/dL (M), 0.6-1.1 (F) | Kidney health [5] |
| ALT | 7-56 U/L | Liver function |
| AST | 10-40 U/L | Liver/heart health |

**Key Points:**
• Values outside normal ranges don't always indicate disease
• Context matters: symptoms, medical history, medications [6]
• Trends over time are often more important than single values
• Always discuss results with your healthcare provider

Would you like me to explain any specific values from your recent results?`,
      citations: [
        { id: 1, text: "Normal CBC reference ranges", source: "American Association of Clinical Chemistry, 2024" },
        { id: 2, text: "Hemoglobin and anemia diagnosis", source: "WHO Guidelines, 2023" },
        { id: 3, text: "Platelet count clinical significance", source: "Journal of Hematology, 2023" },
        { id: 4, text: "Fasting glucose diabetes criteria", source: "American Diabetes Association, 2024" },
        { id: 5, text: "Creatinine and GFR assessment", source: "National Kidney Foundation, 2024" },
        { id: 6, text: "Lab test interpretation guidelines", source: "Clinical Laboratory Standards Institute, 2023" }
      ]
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      citations: response.citations
    }])
    return response.content
  }

  if (lowerInput.includes('medication') || lowerInput.includes('medicine') || lowerInput.includes('prescription') || lowerInput.includes('pill')) {
    const content = `I can help you understand your medications better.

**Important Medication Information:**

For each medication, it's good to know:
• **Purpose**: What condition it treats
• **Dosage**: When and how much to take
• **Side Effects**: What to watch for
• **Interactions**: Foods or drugs to avoid
• **Duration**: How long you'll take it

**Common Medication Classes:**
• Blood Pressure: ACE inhibitors, Beta blockers
• Diabetes: Metformin, Insulin
• Cholesterol: Statins
• Pain Relief: NSAIDs, Acetaminophen

Which medication would you like to know more about? I can explain its purpose, side effects, and important precautions.`

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }])
    return content
  }

  if (lowerInput.includes('appointment') || lowerInput.includes('schedule')) {
    const content = `I can assist you with appointment management.

**Your Appointments:**
You can view and manage your appointments in the Appointments section.

**Before Your Appointment:**
• Prepare a list of current symptoms
• Note any medication changes
• Write down questions for your doctor
• Bring your insurance card and ID
• Arrive 15 minutes early

**Types of Visits:**
• Annual checkup
• Follow-up appointment
• Specialist consultation
• Telehealth/Virtual visit

Would you like me to help you prepare questions for your next appointment?`

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }])
    return content
  }

  if (lowerInput.includes('vital') || lowerInput.includes('blood pressure') || lowerInput.includes('bp') || lowerInput.includes('heart rate')) {
    const response = {
      content: `Let me help you understand your vital signs with detailed reference ranges:

**Blood Pressure Categories** [1]

| Category | Systolic (mmHg) | Diastolic (mmHg) | Action |
|----------|----------------|------------------|--------|
| Normal | <120 | and <80 | Maintain healthy lifestyle |
| Elevated | 120-129 | and <80 | Lifestyle modifications |
| Stage 1 HTN | 130-139 | or 80-89 | Consider medication [2] |
| Stage 2 HTN | ≥140 | or ≥90 | Medication recommended |
| Hypertensive Crisis | >180 | and/or >120 | Emergency care needed |

**Heart Rate Ranges**

| Category | Rate (bpm) | Notes |
|----------|------------|-------|
| Athlete | 40-60 | Well-trained individuals [3] |
| Normal | 60-100 | At rest |
| Tachycardia | >100 | May indicate stress, fever, or cardiac issues |
| Bradycardia | <60 | Can be normal if athletic [4] |

**Other Vital Signs** [5]

| Vital Sign | Normal Range | Critical Values |
|------------|--------------|-----------------|
| Temperature | 97-99°F (36.1-37.2°C) | <95°F or >103°F |
| Respiratory Rate | 12-20 breaths/min | <10 or >30 |
| Oxygen Saturation | 95-100% | <90% needs attention |
| BMI | 18.5-24.9 | <18.5 or >30 |

Which vital sign would you like more detailed information about?`,
      citations: [
        { id: 1, text: "Blood pressure classification", source: "American Heart Association, 2024" },
        { id: 2, text: "Hypertension treatment guidelines", source: "ACC/AHA Clinical Practice Guidelines, 2023" },
        { id: 3, text: "Athlete heart rate norms", source: "Sports Medicine Journal, 2023" },
        { id: 4, text: "Bradycardia clinical significance", source: "Journal of Cardiology, 2024" },
        { id: 5, text: "Vital signs reference ranges", source: "Clinical Nursing Standards, 2024" }
      ]
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      citations: response.citations
    }])
    return response.content
  }

  if (lowerInput.includes('symptom') || lowerInput.includes('pain') || lowerInput.includes('sick') || lowerInput.includes('feel')) {
    const content = `I understand you're experiencing symptoms. While I can provide general information, it's important to consult your healthcare provider for medical advice.

**When to Seek Care:**

**Emergency (Call 911):**
• Chest pain or pressure
• Difficulty breathing
• Severe bleeding
• Loss of consciousness
• Stroke symptoms (FAST)

**Urgent Care:**
• High fever (>103°F)
• Severe pain
• Persistent vomiting
• Signs of infection

**Contact Your Provider:**
• New or worsening symptoms
• Medication concerns
• Follow-up questions

You can message your provider securely through the Messages section. Would you like me to help you describe your symptoms to send to your doctor?`

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }])
    return content
  }

  if (lowerInput.includes('diet') || lowerInput.includes('nutrition') || lowerInput.includes('food') || lowerInput.includes('eat')) {
    const content = `I can provide general nutrition guidance for your health conditions.

**Healthy Eating Basics:**

**For General Health:**
• Fruits & vegetables: 5+ servings daily
• Whole grains over refined grains
• Lean proteins (fish, poultry, legumes)
• Limit processed foods and added sugars
• Stay hydrated: 8 glasses of water daily

**Condition-Specific Diets:**
• **Diabetes**: Monitor carbohydrates, choose low glycemic foods
• **Hypertension**: DASH diet, limit sodium to <2300mg/day
• **High Cholesterol**: Reduce saturated fats, add omega-3s
• **Heart Health**: Mediterranean diet pattern

Would you like specific dietary recommendations for any of your health conditions?`

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }])
    return content
  }

  if (lowerInput.includes('insurance') || lowerInput.includes('billing') || lowerInput.includes('payment') || lowerInput.includes('cost')) {
    const content = `I can help you with billing and insurance questions.

**Insurance & Billing:**

**Understanding Your Bill:**
• Date of service
• Provider/facility charges
• Insurance payments
• Your responsibility

**Insurance Terms:**
• **Deductible**: Amount you pay before insurance kicks in
• **Copay**: Fixed amount per visit
• **Coinsurance**: Percentage you pay after deductible
• **Out-of-pocket max**: Most you'll pay in a year

**Need Help?**
• View statements in the Billing section
• Check insurance coverage details
• Set up payment plans
• Download receipts for HSA/FSA

Would you like help understanding a specific charge or setting up a payment plan?`

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }])
    return content
  }

  const content = `I'm here to help you with your health and medical questions. I specialize in:

**Medical Information:**
• Lab results and test interpretations
• Medication information and interactions
• Vital signs and health metrics
• Symptom guidance

**Health Management:**
• Appointment scheduling and preparation
• Treatment plan understanding
• Preventive care recommendations
• Lifestyle and nutrition guidance

**Portal Navigation:**
• Accessing your health records
• Messaging your care team
• Managing prescriptions
• Billing and insurance

What specific aspect of your health would you like to discuss? I'm here to provide clear, helpful information to support your healthcare journey.`

  setMessages(prev => [...prev, {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content,
    timestamp: new Date()
  }])
  return content
}
