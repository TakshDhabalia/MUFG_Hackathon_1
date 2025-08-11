import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export function ChatMessage({ message, isTyping = false }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0 mt-1">
        <AvatarFallback className={message.isUser ? "bg-primary/10" : "bg-secondary/10"}>
          {message.isUser ? (
            <User className="w-4 h-4 text-primary" />
          ) : (
            <Bot className="w-4 h-4 text-secondary" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
        <div className={message.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
          <p className={`text-sm leading-relaxed ${isTyping ? 'message-typing' : ''}`}>
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}