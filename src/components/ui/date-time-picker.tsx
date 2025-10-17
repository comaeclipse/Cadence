"use client";

import * as React from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateTimePickerProps {
  date?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
}

export function DateTimePicker({ date, onChange, placeholder = "Pick date & time" }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const hours = selectedDate?.getHours() ?? new Date().getHours();
  const minutes = selectedDate?.getMinutes() ?? new Date().getMinutes();

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    const updated = new Date(newDate);
    updated.setHours(hours);
    updated.setMinutes(minutes);
    setSelectedDate(updated);
    onChange?.(updated);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const updated = new Date(selectedDate || new Date());
    if (type === 'hours') {
      updated.setHours(parseInt(value));
    } else {
      updated.setMinutes(parseInt(value));
    }
    setSelectedDate(updated);
    onChange?.(updated);
  };

  const handleNow = () => {
    const now = new Date();
    setSelectedDate(now);
    onChange?.(now);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            <span>
              {format(selectedDate, "MMM d, yyyy")} at {format(selectedDate, "h:mm a")}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />

          {/* Time Selection */}
          <div className="border-t p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Time</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Hours */}
              <Select
                value={hours.toString()}
                onValueChange={(value) => handleTimeChange('hours', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-lg font-medium">:</span>

              {/* Minutes */}
              <Select
                value={minutes.toString()}
                onValueChange={(value) => handleTimeChange('minutes', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleNow}
              >
                Now
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
