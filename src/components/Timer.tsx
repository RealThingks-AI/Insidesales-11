import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";

interface TimerProps {
  onSave: (entry: { task: string; duration: number; timestamp: number }) => void;
}

export const Timer = ({ onSave }: TimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [task, setTask] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!task.trim()) {
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (seconds > 0 && task.trim()) {
      onSave({
        task: task.trim(),
        duration: seconds,
        timestamp: Date.now(),
      });
    }
    setIsRunning(false);
    setSeconds(0);
    setTask("");
  };

  return (
    <Card className="p-8 shadow-lg border-border/50">
      <div className="space-y-6">
        <Input
          placeholder="What are you working on?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={isRunning}
          className="text-lg h-12"
        />

        <div className="text-center">
          <div
            className={`text-6xl font-bold tabular-nums tracking-tight transition-all duration-300 ${
              isRunning ? "text-primary animate-pulse" : "text-foreground"
            }`}
          >
            {formatTime(seconds)}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {!isRunning ? (
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!task.trim()}
              className="gap-2"
            >
              <Play className="w-5 h-5" />
              Start
            </Button>
          ) : (
            <>
              <Button size="lg" variant="secondary" onClick={handlePause} className="gap-2">
                <Pause className="w-5 h-5" />
                Pause
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={handleStop}
                className="gap-2"
              >
                <Square className="w-5 h-5" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
