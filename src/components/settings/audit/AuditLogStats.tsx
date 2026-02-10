import { Card, CardContent } from "@/components/ui/card";
import { Activity, FileText, Users, Clock } from "lucide-react";

interface AuditLogStatsProps {
  total: number;
  todayCount: number;
  weekCount: number;
  byModule: Record<string, number>;
  byUser: Record<string, number>;
  userNames: Record<string, string>;
}

export const AuditLogStats = ({ total, todayCount, weekCount, byModule, byUser, userNames }: AuditLogStatsProps) => {
  // Top 4 modules
  const topModules = Object.entries(byModule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Top 3 users
  const topUsers = Object.entries(byUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <Card>
        <CardContent className="p-4 text-center">
          <Activity className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-muted-foreground">Total Events</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-2xl font-bold">{todayCount}</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-2xl font-bold">{weekCount}</div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </CardContent>
      </Card>
      {topModules.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <FileText className="h-5 w-5 mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground mb-1">Top Modules</div>
            {topModules.map(([mod, count]) => (
              <div key={mod} className="flex justify-between text-xs">
                <span className="truncate">{mod}</span>
                <span className="font-semibold ml-2">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {topUsers.length > 0 && (
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <Users className="h-5 w-5 mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground mb-1">Most Active Users</div>
            {topUsers.map(([userId, count]) => (
              <div key={userId} className="flex justify-between text-xs">
                <span className="truncate">{userNames[userId] || userId.substring(0, 8)}</span>
                <span className="font-semibold ml-2">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
