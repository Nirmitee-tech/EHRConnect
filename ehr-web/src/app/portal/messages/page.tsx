'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  User,
  Clock,
  CheckCheck,
  Filter,
  Paperclip,
  MoreVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function MessagesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // New message dialog
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const [providers, setProviders] = useState<any[]>([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [newMessageSubject, setNewMessageSubject] = useState('')
  const [newMessageBody, setNewMessageBody] = useState('')

  useEffect(() => {
    fetchConversations()
    fetchProviders()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/patient/messages/conversations')
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/patient/providers')
      const data = await response.json()
      setProviders(data.providers || [])
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/patient/messages/${conversationId}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    try {
      setSending(true)
      const response = await fetch('/api/patient/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          recipientId: selectedConversation.providerId,
          message: messageText,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      setMessages([...messages, data.message])
      setMessageText('')

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleNewMessage = async () => {
    if (!selectedProvider || !newMessageSubject.trim() || !newMessageBody.trim()) return

    try {
      setSending(true)
      const response = await fetch('/api/patient/messages/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedProvider,
          subject: newMessageSubject,
          message: newMessageBody,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      // Add new conversation and select it
      setConversations([data.conversation, ...conversations])
      setSelectedConversation(data.conversation)
      setNewMessageOpen(false)
      setNewMessageSubject('')
      setNewMessageBody('')
      setSelectedProvider('')

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.providerName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* WhatsApp-like Messages Interface */}
      <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Provider/Conversations List - WhatsApp Style */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r border-gray-200 flex-col bg-white`}>
          {/* List Header */}
          <div className="bg-[#f0f2f5] border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                    <DialogDescription>
                      Send a secure message to your healthcare provider
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">To: Provider *</Label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger id="provider">
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              Dr. {provider.name?.[0]?.given?.[0]} {provider.name?.[0]?.family}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        value={newMessageSubject}
                        onChange={(e) => setNewMessageSubject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Type your message here..."
                        value={newMessageBody}
                        onChange={(e) => setNewMessageBody(e.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setNewMessageOpen(false)}
                      disabled={sending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleNewMessage}
                      disabled={sending || !selectedProvider || !newMessageSubject || !newMessageBody}
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div>
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedConversation?.id === conversation.id ? 'bg-[#f0f2f5]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={conversation.providerPhoto} />
                        <AvatarFallback className="bg-blue-500 text-white font-semibold">
                          {conversation.providerName?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {conversation.providerName}
                          </p>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {conversation.lastMessageDate &&
                              format(new Date(conversation.lastMessageDate), 'MMM d')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="ml-2 rounded-full h-5 min-w-[20px] flex items-center justify-center bg-green-500 hover:bg-green-600"
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No conversations yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start messaging your healthcare providers
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setNewMessageOpen(true)}
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area - WhatsApp Style */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#efeae2]`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden rounded-full hover:bg-gray-200"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.providerPhoto} />
                      <AvatarFallback className="bg-blue-500 text-white font-semibold">
                        {selectedConversation.providerName?.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {selectedConversation.providerName}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {selectedConversation.providerRole || 'Healthcare Provider'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Messages - WhatsApp Style Background */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-2"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0 L50 50 L0 100\' fill=\'none\' stroke=\'%23d1d1d1\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3Cpath d=\'M50 0 L100 50 L50 100\' fill=\'none\' stroke=\'%23d1d1d1\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")',
                  backgroundColor: '#efeae2'
                }}
              >
                {messages.length > 0 ? (
                  messages.map((message, idx) => {
                    const isOwn = message.senderId === session?.user?.id
                    return (
                      <div
                        key={message.id || idx}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                      >
                        <div
                          className={`relative max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                            isOwn
                              ? 'bg-[#d9fdd3]'
                              : 'bg-white'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold text-blue-600 mb-1">
                              {selectedConversation.providerName}
                            </p>
                          )}
                          <p className="text-sm text-gray-900 break-words">
                            {message.payload?.[0]?.contentString || message.text}
                          </p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-gray-600' : 'text-gray-500'}`}>
                            <span className="text-[10px]">
                              {message.sent && format(new Date(message.sent), 'h:mm a')}
                            </span>
                            {isOwn && (
                              <CheckCheck className={`w-4 h-4 ${message.read ? 'text-blue-500' : 'text-gray-400'}`} />
                            )}
                          </div>
                          {/* WhatsApp-like tail */}
                          <div
                            className={`absolute top-0 w-0 h-0 ${
                              isOwn
                                ? 'right-[-8px] border-l-[8px] border-l-[#d9fdd3] border-t-[8px] border-t-transparent'
                                : 'left-[-8px] border-r-[8px] border-r-white border-t-[8px] border-t-transparent'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-8">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">No messages yet</p>
                      <p className="text-sm text-gray-600">
                        Send a message to start the conversation
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input - WhatsApp Style */}
              <div className="bg-[#f0f2f5] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 rounded-full hover:bg-gray-200"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </Button>
                  <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-4 py-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      rows={1}
                      className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm p-0 max-h-32"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    size="icon"
                    className="flex-shrink-0 rounded-full bg-green-500 hover:bg-green-600"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
              <div className="text-center px-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-16 h-16 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  EHRConnect Messages
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Select a provider from the list to view your conversation history and send secure messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
