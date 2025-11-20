import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock } from "lucide-react";

interface TimeEntryProps {
  entry: {
    id: string;
    task: string;
    duration: number;
    timestamp: number;
  };
  onDelete: (id: string) => void;
}

export const TimeEntry = ({ entry, onDelete }: TimeEntryProps) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{entry.task}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(entry.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <Clock className="w-4 h-4" />
            {formatDuration(entry.duration)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
