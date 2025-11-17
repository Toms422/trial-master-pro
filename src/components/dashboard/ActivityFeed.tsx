import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, FileCheck, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface Activity {
  id: string;
  participant_name: string;
  action_type: "arrival" | "form_completion";
  timestamp: string;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch recent activities
  const { data: participants } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("id, full_name, arrived, arrived_at, form_completed, form_completed_at")
        .or("arrived.eq.true,form_completed.eq.true")
        .order("updated_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  // Process activities
  useEffect(() => {
    if (!participants) return;

    const newActivities: Activity[] = [];

    participants.forEach((p) => {
      if (p.arrived && p.arrived_at) {
        newActivities.push({
          id: `${p.id}-arrival`,
          participant_name: p.full_name,
          action_type: "arrival",
          timestamp: p.arrived_at,
        });
      }
      if (p.form_completed && p.form_completed_at) {
        newActivities.push({
          id: `${p.id}-form`,
          participant_name: p.full_name,
          action_type: "form_completion",
          timestamp: p.form_completed_at,
        });
      }
    });

    // Sort by timestamp descending
    newActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setActivities(newActivities.slice(0, 15));
  }, [participants]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('activity-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'participants'
        },
        () => {
          // Refetch data when updates occur
          supabase
            .from("participants")
            .select("id, full_name, arrived, arrived_at, form_completed, form_completed_at")
            .or("arrived.eq.true,form_completed.eq.true")
            .order("updated_at", { ascending: false })
            .limit(50)
            .then(({ data }) => {
              if (data) {
                const newActivities: Activity[] = [];
                data.forEach((p) => {
                  if (p.arrived && p.arrived_at) {
                    newActivities.push({
                      id: `${p.id}-arrival`,
                      participant_name: p.full_name,
                      action_type: "arrival",
                      timestamp: p.arrived_at,
                    });
                  }
                  if (p.form_completed && p.form_completed_at) {
                    newActivities.push({
                      id: `${p.id}-form`,
                      participant_name: p.full_name,
                      action_type: "form_completion",
                      timestamp: p.form_completed_at,
                    });
                  }
                });
                newActivities.sort((a, b) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setActivities(newActivities.slice(0, 15));
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActivityIcon = (type: Activity["action_type"]) => {
    switch (type) {
      case "arrival":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "form_completion":
        return <FileCheck className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-slate-600" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.action_type) {
      case "arrival":
        return "הגיע למתחם";
      case "form_completion":
        return "השלים טופס";
      default:
        return "פעולה";
    }
  };

  const getActivityColor = (type: Activity["action_type"]) => {
    switch (type) {
      case "arrival":
        return "bg-emerald-50 border-emerald-200";
      case "form_completion":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-slate-900">פעילות אחרונה</CardTitle>
            <CardDescription className="text-slate-600">
              עדכונים בזמן אמת • 15 פעולות אחרונות
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-600 font-medium">חי</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Clock className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">אין פעילות עדיין</p>
              <p className="text-sm text-slate-400 mt-1">פעילויות יופיעו כאן כשנסיינים יגיעו</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-md animate-fade-in ${getActivityColor(activity.action_type)}`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {activity.participant_name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {getActivityText(activity)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-slate-500 font-medium">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: he,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
