"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
  MicIcon,
  MicOffIcon,
  BotIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  CopyIcon,
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: string
  actions?: Array<{ label: string; href: string; isExternal?: boolean }>
}

let chatbotMsgCount = 0
function makeMessageId(prefix: string): string {
  chatbotMsgCount += 1
  return `${prefix}-${chatbotMsgCount}-${Math.random().toString(36).slice(2, 7)}`
}

function getCurrentTimestamp(): string {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch {
    return "Just now"
  }
}

const INITIAL_SUGGESTIONS = [
  "👑 How do I book Protocol VIP hostesses?",
  "🛍️ What luxury items are in Elimi Shop?",
  "🖨️ PrintBe roll-up banners & prices",
  "🚗 Rent a Mercedes V-Class or Prado",
]

export function Chatbot({
  initialTitle = "New Chat",
  initialDescription = "How can I help you today?",
  className = "",
  onClose,
}: {
  initialTitle?: string
  initialDescription?: string
  className?: string
  onClose?: () => void
}) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Muraho! 👋 I am your **ELIMI AI Concierge**.\n\nHow can I assist you with our luxury services in Burundi?\n\n- 👑 **Protocol Staffing & VIP Escort**\n- 🛍️ **Elimi Boutique & Tech Shop**\n- 🖨️ **PrintBe Banners & Custom Branding**\n- 🎬 **Elimi Média Shows & Live Streams**\n- 📞 **Direct WhatsApp Concierge Dispatch**",
      timestamp: "Just now",
      actions: [
        { label: "👑 Protocol Hub", href: "/protocol" },
        { label: "🛍️ Elimi Shop", href: "/shop" },
        { label: "🖨️ PrintBe", href: "/printbe" },
        { label: "💬 WhatsApp Desk", href: "https://wa.me/25764444546", isExternal: true },
      ],
    },
  ])

  const [inputQuery, setInputQuery] = React.useState("")
  const [status, setStatus] = React.useState<"ready" | "submitted" | "streaming">("ready")
  const [isListening, setIsListening] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)

  const messagesContainerRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const isBusy = status === "submitted" || status === "streaming"

  // Auto-scroll handler
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      })
    }
  }

  // Scroll listener for jump-to-bottom button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80
    setShowScrollButton(isScrolledUp)
  }

  React.useEffect(() => {
    scrollToBottom("smooth")
  }, [messages, status])

  // Speech Recognition (Dictation) with Mic button
  const toggleListening = () => {
    if (typeof window === "undefined") return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = "en-US"
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim()
    if (!query || isBusy) return

    const userMsg: Message = {
      id: makeMessageId("user"),
      role: "user",
      content: query,
      timestamp: getCurrentTimestamp(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputQuery("")
    setStatus("submitted")

    try {
      setStatus("streaming")
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({
            sender: m.role === "user" ? "user" : "ai",
            text: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Chat request failed")
      }

      const data = await response.json()
      const replyText =
        data.text ||
        "I am ready to assist you. How can I help with Protocol, Shop, PrintBe, or Mobility?"

      // Detect relevant action buttons
      const actions: Array<{ label: string; href: string; isExternal?: boolean }> = []
      const lower = replyText.toLowerCase()
      if (lower.includes("/protocol") || lower.includes("protocol")) {
        actions.push({ label: "👑 Protocol Hub", href: "/protocol" })
      }
      if (lower.includes("/shop") || lower.includes("shop") || lower.includes("boutique")) {
        actions.push({ label: "🛍️ Elimi Shop", href: "/shop" })
      }
      if (lower.includes("/printbe") || lower.includes("print")) {
        actions.push({ label: "🖨️ PrintBe", href: "/printbe" })
      }
      if (lower.includes("/media") || lower.includes("media") || lower.includes("video")) {
        actions.push({ label: "🎬 Elimi Média", href: "/media" })
      }
      actions.push({
        label: "💬 WhatsApp Desk",
        href: "https://wa.me/25764444546",
        isExternal: true,
      })

      const aiMsg: Message = {
        id: makeMessageId("ai"),
        role: "assistant",
        content: replyText,
        timestamp: getCurrentTimestamp(),
        actions: actions.length > 0 ? actions : undefined,
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch {
      const fallbackMsg: Message = {
        id: makeMessageId("err"),
        role: "assistant",
        content:
          "Thank you for contacting ELIMI Concierge! Our team is available on WhatsApp (+257 64 44 45 46) for fast assistance with protocol staffing, vehicle fleet rentals, and luxury shopping.",
        timestamp: getCurrentTimestamp(),
        actions: [
          { label: "💬 Chat on WhatsApp", href: "https://wa.me/25764444546", isExternal: true },
          { label: "👑 Protocol Page", href: "/protocol" },
        ],
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setStatus("ready")
    }
  }

  const handleReset = () => {
    setMessages([])
    setInputQuery("")
    setStatus("ready")
  }

  // Formatted text renderer
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />
      }

      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-semibold text-xs text-slate-900 mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        )
      }

      const isBullet = line.startsWith("- ") || line.startsWith("* ")
      const rawText = isBullet ? line.substring(2) : line

      // Parse bold **text** and markdown links [Label](url)
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      const regex = /(\*\*(.*?)\*\*)|(\[(.*?)\]\((.*?)\))/g
      let match

      while ((match = regex.exec(rawText)) !== null) {
        if (match.index > lastIndex) {
          parts.push(rawText.substring(lastIndex, match.index))
        }

        if (match[1]) {
          parts.push(
            <strong key={`${idx}-${match.index}`} className="font-semibold text-slate-900">
              {match[2]}
            </strong>
          )
        } else if (match[3]) {
          const linkLabel = match[4]
          const linkHref = match[5]
          const isExternal =
            linkHref.startsWith("http") || linkHref.startsWith("https://wa.me")

          if (isExternal) {
            parts.push(
              <a
                key={`${idx}-${match.index}`}
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0D52FF] hover:underline font-medium inline-flex items-center gap-0.5"
              >
                <span>{linkLabel}</span>
                <ExternalLinkIcon className="w-2.5 h-2.5 inline" />
              </a>
            )
          } else {
            parts.push(
              <Link
                key={`${idx}-${match.index}`}
                href={linkHref}
                className="text-[#0D52FF] hover:underline font-medium"
              >
                {linkLabel}
              </Link>
            )
          }
        }

        lastIndex = match.index + match[0].length
      }

      if (lastIndex < rawText.length) {
        parts.push(rawText.substring(lastIndex))
      }

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 text-xs text-slate-800">
            <span className="text-[#0D52FF] font-bold">•</span>
            <div className="flex-1 leading-relaxed">{parts}</div>
          </div>
        )
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-800 my-0.5">
          {parts}
        </p>
      )
    })
  }

  return (
    <div className={`relative flex flex-col gap-4 ${className}`}>
      <Card className="mx-auto h-140 w-full max-w-sm gap-0 border-slate-200/90 shadow-xl bg-white">
        {/* Header */}
        <CardHeader className="border-b border-slate-100 p-4 pb-3">
          <div className="flex flex-col">
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              {initialTitle}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              {initialDescription}
            </CardDescription>
          </div>
          <CardAction className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Reset conversation"
              disabled={messages.length === 0 || isBusy}
              onClick={handleReset}
              className="h-8 w-8 rounded-full border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <RotateCwIcon className="h-3.5 w-3.5" />
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </Button>
            )}
          </CardAction>
        </CardHeader>

        {/* Message Area */}
        <CardContent className="min-h-0 flex-1 overflow-hidden p-0 relative bg-slate-50/50">
          {messages.length === 0 ? (
            <Empty className="h-full flex flex-col justify-center items-center p-6 text-center">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon className="h-6 w-6 text-slate-600 stroke-[1.5]" />
                </EmptyMedia>
                <EmptyTitle>Morning, Guest!</EmptyTitle>
                <EmptyDescription>
                  What are we working on today? Type a question or tap the mic below to start a new
                  conversation.
                </EmptyDescription>
              </EmptyHeader>

              {/* Starter Suggestion Chips */}
              <div className="mt-4 flex flex-col gap-1.5 w-full max-w-[260px]">
                {INITIAL_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item)}
                    className="text-left text-[11px] font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-[#0D52FF] hover:border-blue-200 border border-slate-200/90 px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer truncate"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Empty>
          ) : (
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto p-4 space-y-3.5"
            >
              {messages.map((message) => {
                const isUser = message.role === "user"

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    } animate-in fade-in slide-in-from-bottom-2 duration-200`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[88%] ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full bg-[#0D52FF] text-white flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                          <BotIcon className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Message Bubble - Distinct Backgrounds for User vs AI */}
                      <div
                        className={`rounded-2xl p-3 text-xs leading-relaxed relative group shadow-2xs ${
                          isUser
                            ? "bg-[#0D52FF] text-white rounded-br-xs font-normal"
                            : "bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="space-y-1">
                            {renderFormattedContent(message.content)}

                            {/* Embedded Action Buttons */}
                            {message.actions && message.actions.length > 0 && (
                              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1">
                                {message.actions.map((act, aIdx) =>
                                  act.isExternal ? (
                                    <a
                                      key={aIdx}
                                      href={act.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full transition"
                                    >
                                      <span>{act.label}</span>
                                      <ExternalLinkIcon className="w-2.5 h-2.5" />
                                    </a>
                                  ) : (
                                    <Link
                                      key={aIdx}
                                      href={act.href}
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-[#0D52FF] border border-blue-200/80 px-2 py-0.5 rounded-full transition"
                                    >
                                      <span>{act.label}</span>
                                      <ArrowRightIcon className="w-2.5 h-2.5" />
                                    </Link>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Copy button on hover for assistant messages */}
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(message.content, message.id)}
                            title="Copy message"
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/90 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700"
                          >
                            {copiedId === message.id ? (
                              <CheckIcon className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <CopyIcon className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {message.timestamp && (
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {message.timestamp}
                      </span>
                    )}
                  </div>
                )
              })}

              {/* Streaming / Busy Indicator */}
              {isBusy && (
                <div className="flex items-end gap-2 max-w-[80%] animate-in fade-in duration-200">
                  <div className="w-6 h-6 rounded-full bg-[#0D52FF] text-white flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                    <BotIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-bl-xs p-2.5 shadow-2xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D52FF] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D52FF] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D52FF] animate-bounce" />
                    <span className="text-[11px] text-slate-400 ml-1">ELIMI AI is writing...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Jump to bottom button */}
          {showScrollButton && (
            <button
              type="button"
              onClick={() => scrollToBottom("smooth")}
              className="absolute bottom-3 right-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full p-1.5 shadow-md flex items-center justify-center transition-all animate-in fade-in cursor-pointer z-10"
              aria-label="Scroll to bottom"
            >
              <ChevronDownIcon className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </CardContent>

        {/* Footer with Input Box, Mic button (replacing plus button), and Send button */}
        <CardFooter className="flex-col gap-2 p-3 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="w-full"
          >
            {/* Input Group Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-[#0D52FF] focus-within:ring-2 focus-within:ring-[#0D52FF]/20 p-2.5 transition flex flex-col gap-1.5 shadow-2xs">
              {/* Text Area */}
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask about protocol, shop, mobility, print..."
                disabled={isBusy}
                className="w-full bg-transparent resize-none text-xs text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed"
              />

              {/* Bottom Actions Row inside Input Box */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                {/* Voice Dictation Mic Button (replaces the Plus icon) */}
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={isListening ? "Stop listening" : "Voice dictation"}
                  title={isListening ? "Listening... click to stop" : "Voice dictation"}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition cursor-pointer border ${
                    isListening
                      ? "bg-red-500 border-red-500 text-white animate-pulse"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
                  }`}
                >
                  {isListening ? (
                    <MicOffIcon className="h-3.5 w-3.5" />
                  ) : (
                    <MicIcon className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isBusy}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer ${
                    inputQuery.trim() && !isBusy
                      ? "bg-[#0D52FF] hover:bg-blue-700 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Send Message</span>
                </button>
              </div>
            </div>
          </form>

          {/* Underneath Helper Footnote */}
          <div className="text-center text-[10px] text-slate-400">
            ELIMI AI Concierge • Press send or use the mic to ask.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
export default Chatbot
