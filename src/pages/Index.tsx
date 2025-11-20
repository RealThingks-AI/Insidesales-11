import { useState, useEffect } from "react";
import { Timer } from "@/components/Timer";
import { TimeEntry } from "@/components/TimeEntry";
import { Stats } from "@/components/Stats";
import { Clock } from "lucide-react";

interface Entry {
  id: string;
  task: string;
  duration: number;
  timestamp: number;
}

const Index = () => {
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem("timeEntries");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("timeEntries", JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = (entry: Omit<Entry, "id">) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">TimeKeeper</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track your time, boost your productivity
          </p>
        </header>

        <div className="space-y-8">
          <Timer onSave={handleSaveEntry} />

          <Stats entries={entries} />

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Recent Entries
            </h2>
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No time entries yet. Start tracking to see your history!
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <TimeEntry
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Index;
