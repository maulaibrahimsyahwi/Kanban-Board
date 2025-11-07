"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type BarChartData = {
  label: string;
  stacks: {
    value: number;
    color: string;
    label: string;
  }[];
};

interface BarChartProps {
  title: string;
  data: BarChartData[];
  legend: { label: string; color: string }[];
}

export default function BarChart({ title, data, legend }: BarChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => d.stacks.reduce((sum, stack) => sum + stack.value, 0)),
    1
  );

  return (
    <Card className="h-full bg-card/50">
      <CardHeader className="pb-0 pt-3">
        <CardTitle className="text-base font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md w-fit">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full px-6 pt-4">
        {/* Chart Area */}
        <div className="flex-1 flex items-stretch gap-4 px-2 min-h-[150px]">
          {data.map((item, index) => {
            // Tambahkan index untuk key unik
            const total = item.stacks.reduce(
              (sum, stack) => sum + stack.value,
              0
            );

            return (
              <div
                // Perbaikan: Gunakan item.label + index untuk memastikan key unik
                key={item.label + index}
                className="flex-1 flex flex-col-reverse items-center gap-1"
              >
                <span className="text-xs text-muted-foreground truncate">
                  {item.label}
                </span>

                <div className="w-full flex flex-col-reverse rounded-t-md flex-1">
                  {item.stacks.map((stack, i) => (
                    <div
                      key={i}
                      className={cn("transition-all", stack.color)}
                      style={{
                        height: `${(stack.value / (total || 1)) * 100}%`,
                      }}
                      title={`${stack.label}: ${stack.value}`}
                    ></div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {total > 0 ? total : ""}
                </span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-4 pt-4 pb-4 border-t border-border">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={cn("w-3 h-3 rounded-full", item.color)}></span>
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
