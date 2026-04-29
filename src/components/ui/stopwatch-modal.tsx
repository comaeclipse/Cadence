"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, RotateCcw, ClipboardPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StopwatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StopwatchModal({ open, onOpenChange }: StopwatchModalProps) {
  const router = useRouter();
  const [elapsed, setElapsed] = React.useState(0); // milliseconds
  const [running, setRunning] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = React.useRef<number>(0);
  const accumulatedRef = React.useRef<number>(0);

  const start = () => {
    if (running) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 50);
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current = 0;
    setElapsed(0);
    setRunning(false);
  };

  // Clean up interval if modal closes while running
  React.useEffect(() => {
    if (!open) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [open]);

  const handleAddToIncident = () => {
    const seconds = Math.round(elapsed / 1000);
    reset();
    onOpenChange(false);
    router.push(`/?openIncident=true&duration=${seconds}`);
  };

  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const tenths = Math.floor((elapsed % 1000) / 100);

  const hasDuration = elapsed > 0;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) pause();
      onOpenChange(val);
    }}>
      <DialogContent className="w-[320px] p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Stopwatch</DialogTitle>
        </DialogHeader>

        {/* Timer display */}
        <div className="flex flex-col items-center gap-6 py-4">
          <div
            className={cn(
              "font-mono text-6xl font-bold tracking-tight tabular-nums transition-colors",
              running ? "text-emerald-600" : hasDuration ? "text-amber-500" : "text-stone-400"
            )}
          >
            {String(minutes).padStart(2, "0")}
            <span className="opacity-60">:</span>
            {String(secs).padStart(2, "0")}
            <span className="text-3xl opacity-50">.{tenths}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={reset}
              disabled={!hasDuration && !running}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              className={cn(
                "h-16 w-16 rounded-full text-white shadow-lg transition-colors",
                running
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={running ? pause : start}
            >
              {running
                ? <Pause className="h-7 w-7" />
                : <Play className="h-7 w-7 translate-x-0.5" />}
            </Button>

            <div className="h-12 w-12" /> {/* spacer to balance layout */}
          </div>

          {/* Add to Incident — shown when paused with elapsed time */}
          {hasDuration && !running && (
            <Button
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white animate-fadeIn"
              onClick={handleAddToIncident}
            >
              <ClipboardPlus className="h-4 w-4" />
              Add to Incident
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
