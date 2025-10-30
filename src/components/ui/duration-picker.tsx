"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DurationPickerProps {
  value?: number; // duration in seconds
  onChange?: (seconds: number) => void;
  placeholder?: string;
}

export function DurationPicker({ value, onChange, placeholder = "Select duration" }: DurationPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [minutes, setMinutes] = React.useState(value ? Math.floor(value / 60) : 0);
  const [seconds, setSeconds] = React.useState(value ? value % 60 : 0);

  React.useEffect(() => {
    if (value !== undefined) {
      setMinutes(Math.floor(value / 60));
      setSeconds(value % 60);
    }
  }, [value]);

  const handleApply = () => {
    const totalSeconds = minutes * 60 + seconds;
    onChange?.(totalSeconds);
    setIsOpen(false);
  };

  const handleClear = () => {
    setMinutes(0);
    setSeconds(0);
    onChange?.(0);
    setIsOpen(false);
  };

  const formatDuration = (mins: number, secs: number) => {
    if (mins === 0 && secs === 0) return placeholder;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const minuteOptions = Array.from({ length: 61 }, (_, i) => i); // 0-60 minutes
  const secondOptions = Array.from({ length: 60 }, (_, i) => i); // 0-59 seconds

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            (!value || value === 0) && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDuration(minutes, seconds)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium">Select Duration</div>

          {/* Scrollable Wheels */}
          <div className="flex gap-2 items-center justify-center">
            {/* Minutes Wheel */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">Minutes</div>
              <div className="relative h-[150px] w-[80px] overflow-hidden">
                <div
                  className="absolute inset-0 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {/* Padding items for centering */}
                  <div className="h-[50px]"></div>

                  {minuteOptions.map((min) => (
                    <div
                      key={min}
                      onClick={() => setMinutes(min)}
                      className={cn(
                        "h-[50px] flex items-center justify-center snap-center cursor-pointer transition-all",
                        minutes === min
                          ? "text-2xl font-bold text-primary"
                          : "text-lg text-muted-foreground"
                      )}
                    >
                      {min}
                    </div>
                  ))}

                  {/* Padding items for centering */}
                  <div className="h-[50px]"></div>
                </div>

                {/* Center highlight */}
                <div className="absolute top-[50px] left-0 right-0 h-[50px] border-y-2 border-primary/20 pointer-events-none"></div>
              </div>
            </div>

            <div className="text-2xl font-bold">:</div>

            {/* Seconds Wheel */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">Seconds</div>
              <div className="relative h-[150px] w-[80px] overflow-hidden">
                <div
                  className="absolute inset-0 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {/* Padding items for centering */}
                  <div className="h-[50px]"></div>

                  {secondOptions.map((sec) => (
                    <div
                      key={sec}
                      onClick={() => setSeconds(sec)}
                      className={cn(
                        "h-[50px] flex items-center justify-center snap-center cursor-pointer transition-all",
                        seconds === sec
                          ? "text-2xl font-bold text-primary"
                          : "text-lg text-muted-foreground"
                      )}
                    >
                      {sec.toString().padStart(2, '0')}
                    </div>
                  ))}

                  {/* Padding items for centering */}
                  <div className="h-[50px]"></div>
                </div>

                {/* Center highlight */}
                <div className="absolute top-[50px] left-0 right-0 h-[50px] border-y-2 border-primary/20 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
