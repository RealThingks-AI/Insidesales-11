import { Card } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

interface StatsProps {
  entries: Array<{
    duration: number;
    timestamp: number;
  }>;
}

export const Stats = ({ entries }: StatsProps) => {
  const today = new Date().setHours(0, 0, 0, 0);
  
  const todayEntries = entries.filter(
    (entry) => new Date(entry.timestamp).setHours(0, 0, 0, 0) === today
  );
  
  const totalToday = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalAll = entries.reduce((sum, entry) => sum + entry.duration, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold text-foreground">
              {formatTime(totalToday)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-accent/10">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold text-foreground">
              {formatTime(totalAll)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
