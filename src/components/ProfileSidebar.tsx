import { User, Target, Shield, TrendingUp, PieChart, HelpCircle, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileSidebarProps {
  onQuickAction: (action: string) => void;
}

export function ProfileSidebar({ onQuickAction }: ProfileSidebarProps) {
  const profileData = {
    name: "Alex Thompson",
    age: 42,
    retirementGoal: 1200000,
    currentBalance: 285000,
    riskProfile: "Balanced",
    contributionRate: 12,
  };

  const progressPercentage = (profileData.currentBalance / profileData.retirementGoal) * 100;

  const quickActions = [
    { 
      icon: TrendingUp, 
      label: "Check Portfolio", 
      action: "Show me my portfolio performance",
      variant: "default" as const
    },
    { 
      icon: PieChart, 
      label: "Asset Allocation", 
      action: "Review my asset allocation",
      variant: "secondary" as const
    },
    { 
      icon: Target, 
      label: "Retirement Goals", 
      action: "Am I on track for retirement?",
      variant: "outline" as const
    },
    { 
      icon: HelpCircle, 
      label: "Explain Term", 
      action: "What is compound interest?",
      variant: "outline" as const
    },
  ];

  return (
    <div className="w-80 bg-muted/20 border-r border-border h-full flex flex-col">
      {/* Profile Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              AT
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{profileData.name}</h3>
            <p className="financial-label">Age {profileData.age}</p>
          </div>
        </div>

        {/* Risk Profile Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="financial-label">Risk Profile:</span>
          <Badge variant="secondary">{profileData.riskProfile}</Badge>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="p-6 space-y-4">
        <Card className="financial-card">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="financial-label">Retirement Progress</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Current Balance</span>
                <span className="financial-amount text-lg text-primary">
                  ${profileData.currentBalance.toLocaleString()}
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressPercentage.toFixed(1)}% to goal</span>
                <span>${profileData.retirementGoal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="financial-card">
          <div className="space-y-3">
            <h4 className="font-medium">Key Metrics</h4>
            
            <div className="portfolio-metric">
              <span className="financial-label">Monthly Contribution</span>
              <span className="financial-amount text-sm">{profileData.contributionRate}%</span>
            </div>
            
            <div className="portfolio-metric">
              <span className="financial-label">Years to Retirement</span>
              <span className="financial-amount text-sm">{65 - profileData.age}</span>
            </div>
            
            <div className="portfolio-metric">
              <span className="financial-label">Est. Monthly at 65</span>
              <span className="financial-amount text-sm text-secondary">$4,800</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="p-6 flex-1">
        <h4 className="font-medium mb-4">Quick Actions</h4>
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => onQuickAction(action.action)}
            >
              <action.icon className="w-4 h-4" />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-6 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
}