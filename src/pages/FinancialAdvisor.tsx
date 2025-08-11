import { useState } from "react";
import { FinancialChat } from "@/components/FinancialChat";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinancialAdvisor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    // This would trigger the chat input in a real implementation
    // For now, we'll just set the input value
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative lg:flex
        transition-transform duration-300 ease-in-out
        z-40 h-full
      `}>
        <ProfileSidebar onQuickAction={handleQuickAction} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <FinancialChat />
      </div>
    </div>
  );
}