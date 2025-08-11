import { useState, useRef, useEffect } from "react";
import { Send, TrendingUp, DollarSign, PieChart, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./ChatMessage";
import { FinancialChart } from "./FinancialChart";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasChart?: boolean;
  chartData?: any;
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your AI superannuation advisor. I can help you optimize your retirement investments, explain financial terms, and provide personalized recommendations based on your goals. What would you like to know today?",
    isUser: false,
    timestamp: new Date(Date.now() - 5000),
  },
];

export function FinancialChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = "";
      let hasChart = false;
      let chartData = null;

      // Simple response logic based on keywords
      if (userMessage.toLowerCase().includes("portfolio") || userMessage.toLowerCase().includes("performance")) {
        response = "Based on your current portfolio allocation, here's your performance over the last 12 months. Your balanced approach with 70% growth assets and 30% defensive assets has yielded a solid 8.2% return. Consider increasing your international equity exposure for better diversification.";
        hasChart = true;
        chartData = {
          type: "line",
          data: [
            { month: "Jan", value: 95000 },
            { month: "Feb", value: 97200 },
            { month: "Mar", value: 96800 },
            { month: "Apr", value: 99100 },
            { month: "May", value: 101500 },
            { month: "Jun", value: 103200 },
            { month: "Jul", value: 105800 },
            { month: "Aug", value: 104200 },
            { month: "Sep", value: 107600 },
            { month: "Oct", value: 109200 },
            { month: "Nov", value: 112400 },
            { month: "Dec", value: 115800 },
          ]
        };
      } else if (userMessage.toLowerCase().includes("allocation") || userMessage.toLowerCase().includes("diversif")) {
        response = "Your current asset allocation shows room for improvement. Here's your breakdown and my recommended adjustments for better long-term growth while managing risk appropriately for your age profile.";
        hasChart = true;
        chartData = {
          type: "pie",
          data: [
            { name: "Australian Shares", value: 35, recommended: 40 },
            { name: "International Shares", value: 25, recommended: 30 },
            { name: "Property", value: 15, recommended: 10 },
            { name: "Bonds", value: 20, recommended: 15 },
            { name: "Cash", value: 5, recommended: 5 },
          ]
        };
      } else if (userMessage.toLowerCase().includes("retirement") || userMessage.toLowerCase().includes("goal")) {
        response = "Based on your retirement goal of $1.2M by age 65, you're currently on track but could accelerate your progress. With your current contribution rate and expected returns, you'll reach approximately $1.05M. I recommend increasing your contributions by $200/month to meet your target.";
      } else {
        response = "That's a great question! I can help you with portfolio optimization, retirement planning, investment explanations, and risk assessment. Feel free to ask about your superannuation performance, asset allocation, or any financial terms you'd like me to explain.";
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        hasChart,
        chartData,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    simulateAIResponse(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="financial-title text-lg">Financial Advisor AI</h2>
            <p className="financial-label">Your superannuation investment assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="message-enter">
            <ChatMessage message={message} />
            {message.hasChart && message.chartData && (
              <div className="mt-3 ml-12">
                <Card className="p-4">
                  <FinancialChart data={message.chartData} />
                </Card>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="message-enter">
            <ChatMessage 
              message={{
                id: "typing",
                content: "Analyzing your request...",
                isUser: false,
                timestamp: new Date(),
              }} 
              isTyping={true}
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-muted/20 p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your superannuation, portfolio performance, or investment advice..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3 max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="quick-action-btn"
            onClick={() => setInputValue("Show me my portfolio performance")}
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Portfolio Performance
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="quick-action-btn"
            onClick={() => setInputValue("Review my asset allocation")}
          >
            <PieChart className="w-3 h-3 mr-1" />
            Asset Allocation
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="quick-action-btn"
            onClick={() => setInputValue("Am I on track for retirement?")}
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Retirement Goal
          </Button>
        </div>
      </div>
    </div>
  );
}