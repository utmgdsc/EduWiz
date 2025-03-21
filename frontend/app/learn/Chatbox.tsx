"use client"
import { useEffect, useState, useRef } from "react"
import { MessageSquareText, X, Send, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Message {
    id: number
    text: string
    sender: "user" | "support"
    timestamp: Date
}

const ChatBox = () => {
    // TODO: minimalize the appearance, we don't want that much stuff
    // TODO: add functionality to load in previous messages, with loading in appearance functionality
    // TODO: finishing touches, make sure chat shows at the correct times
    // TODO: plan out integrations with backend

    const [showChatPrompt, setShowChatPrompt] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! How can I help you today?",
            sender: "support",
            timestamp: new Date(),
        },
    ])
    const [newMessage, setNewMessage] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent): void => {
            const screenWidth = window.innerWidth
            const screenHeight = window.innerHeight

            // showing the chat open prompt if mouse is within 200px of the screens right and bottom
            if (e.clientX > screenWidth - 200 && e.clientY > screenHeight - 200) {
                setShowChatPrompt(true)
            } else {
                setShowChatPrompt(false)
            }
        }

        window.addEventListener("mousemove", handleMouseMove)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: newMessage,
            sender: "user",
            timestamp: new Date(),
        }

        setMessages([...messages, userMessage])
        setNewMessage("")

        // Simulate support response after a short delay
        setTimeout(() => {
            const supportMessage: Message = {
                id: messages.length + 2,
                text: "Thanks for your message! Our team will get back to you shortly.",
                sender: "support",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, supportMessage])
        }, 1000)
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <main className="z-50">

            <Popover open={isOpen} onOpenChange={setIsOpen} modal>
                <PopoverTrigger asChild>
                    <button
                        className={`fixed bottom-0 right-0 transition-transform duration-200 ease-in-out z-50 p-4
              ${showChatPrompt ? "translate-x-0" : "translate-x-full"}`}
                    >
                        <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-secondary hover:bg-background shadow-md">
                            <MessageSquareText />
                        </div>
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[350px] h-[450px] p-0 border rounded-lg shadow-lg flex flex-col overflow-hidden"
                    side="top"
                    align="end"
                    alignOffset={-20}
                    sideOffset={16}
                >
                    {/* Chat Header */}
                    <div className="p-3 border-b bg-primary text-primary-foreground flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 bg-primary-foreground">
                                <Bot className="h-4 w-4 text-primary" />
                            </Avatar>
                            <div>
                                <h3 className="font-medium text-sm">Live Support</h3>
                                <p className="text-xs opacity-80">We typically reply in a few minutes</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-primary-foreground/20 text-primary-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] ${message.sender === "user"
                                                ? "bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                                                : "bg-transparent"
                                            } p-3 shadow-sm`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {message.sender === "support" ? (
                                                null
                                            ) : (
                                                null
                                            )}
                                            <span className="text-xs opacity-70">
                                                {message.sender === "support" ? null : "You •"} {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm">{message.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-background">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSendMessage()
                                    }
                                }}
                                className="flex-1"
                            />
                            <Button onClick={handleSendMessage} size="icon" className="rounded-full">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </main>
    )
}

export default ChatBox

