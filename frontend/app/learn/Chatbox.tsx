"use client";
import { useEffect, useState, useRef } from "react";
import { MessageSquareText, X, Send, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DocumentReference } from "firebase/firestore";
import { getChat, updateChat } from "@/lib/firebase/chat";
import { LLMMessage } from "@/lib/firebase/schema";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const ChatBox = ({
  chatDocID,
  userID,
}: {
  chatDocID: string;
  userID: string;
}) => {
  const [chatLoading, setChatLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // load chat data and create chat object
  useEffect(() => {
    const loadChatData = async () => {
      const loadedChat = await getChat(chatDocID);
      if (loadChatData === null) return;
      setMessages(loadedChat!.conversation);
      setChatLoading(false);
    };
    loadChatData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    setBotTyping(true);
    // Add user message
    const userMessage: LLMMessage = {
      user: "user",
      message: newMessage,
    };
    setMessages([...messages, userMessage]);
    setNewMessage("");

    // TODO: api request to get response for questino from ai
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const reply: LLMMessage = {
      user: "bot",
      message: "replied!",
    };
    setMessages([...messages, userMessage, reply]);
    setBotTyping(false);

    await updateChat(chatDocID, {
      conversation: [...messages, userMessage, reply],
    }); // updating messages in database
  };

  return (
    <main className="z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen} modal>
        <PopoverTrigger asChild>
          {true ? (
            <button
              className={`fixed bottom-0 right-0 transition-transform duration-200 ease-in-out z-50 p-4
              `}
            >
              <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-secondary hover:bg-background border shadow-md">
                <MessageSquareText />
              </div>
            </button>
          ) : null}
        </PopoverTrigger>
        <PopoverContent
          className="w-[350px] h-[450px] p-0 border rounded-lg shadow-lg flex flex-col overflow-hidden mr-4"
          side="top"
          align="end"
          alignOffset={-20}
          sideOffset={16}
        >
          {/* Chat Header */}
          <div className="p-3 border-b bg-primary text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Ask away!</h3>
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
              {chatLoading ? (
                <svg
                  viewBox="0 0 400 400"
                  className="self-center animate-spin w-full h-full"
                >
                  <circle
                    cx="200"
                    cy="200"
                    fill="none"
                    r="60"
                    strokeWidth="7"
                    stroke="#FFFFFF"
                    strokeDasharray="300 1400"
                  />
                </svg>
              ) : null}
              {messages.map((message) => (
                <div
                  key={crypto.randomUUID()}
                  className={`flex ${
                    message.user === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.user === "user"
                        ? "bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                        : "bg-transparent"
                    } p-3 shadow-sm`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}

              {botTyping && (
                <div className="flex justify-start">
                  <div
                    className={`max-w-[80%] bg-transparent p-3 shadow-sm flex items-center gap-3`}
                  >
                    <div className="flex space-x-1">
                      <span
                        className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      ></span>
                      <span
                        className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}

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
                disabled={chatLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="rounded-full"
                disabled={chatLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </main>
  );
};

export default ChatBox;
