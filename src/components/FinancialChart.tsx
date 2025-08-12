import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface ChartData {
  type: "line" | "pie";
  data: any[];
}

interface FinancialChartProps {
  data: ChartData;
}

const COLORS = {
  primary: "hsl(208 100% 47%)",
  secondary: "hsl(142 70% 45%)",
  accent: "hsl(120 60% 50%)",
  muted: "hsl(210 15% 65%)",
  warning: "hsl(38 92% 50%)",
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.muted, COLORS.warning];

export function FinancialChart({ data }: FinancialChartProps) {
  if (data.type === "line") {
    return (
      <div className="w-full h-64">
        <h4 className="financial-label mb-3">Portfolio Value Over Time</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, "Portfolio Value"]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (data.type === "pie") {
    return (
      <div className="w-full h-64">
        <h4 className="financial-label mb-3">Asset Allocation</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any, name: string) => [`${value}%`, name]}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Recommendations */}
        {data.data.some((item: any) => item.recommended) && (
          <div className="mt-4 space-y-2">
            <h5 className="financial-label">Recommended Adjustments:</h5>
            {data.data.map((item: any, index: number) => {
              if (item.recommended && item.value !== item.recommended) {
                const change = item.recommended - item.value;
                return (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{item.name}:</span>
                    <span className={change > 0 ? "text-accent" : "text-destructive"}>
                      {change > 0 ? "+" : ""}{change}%
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}