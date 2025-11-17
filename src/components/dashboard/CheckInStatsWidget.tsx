import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, FileCheck } from "lucide-react";

interface ParticipantStats {
  total: number;
  checkedIn: number;
  pending: number;
  completedForms: number;
}

export default function CheckInStatsWidget() {
  const [stats, setStats] = useState<ParticipantStats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    completedForms: 0,
  });

  // Fetch participants data
  const { data: participants } = useQuery({
    queryKey: ["participants-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("arrived, form_completed");
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });

  // Calculate stats whenever participants data changes
  useEffect(() => {
    if (!participants) return;

    const total = participants.length;
    const checkedIn = participants.filter(p => p.arrived).length;
    const completedForms = participants.filter(p => p.form_completed).length;
    const pending = total - checkedIn;

    setStats({ total, checkedIn, pending, completedForms });
  }, [participants]);

  // Set up realtime subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants'
        },
        () => {
          // Trigger refetch when any change occurs
          supabase
            .from("participants")
            .select("arrived, form_completed")
            .then(({ data }) => {
              if (data) {
                const total = data.length;
                const checkedIn = data.filter(p => p.arrived).length;
                const completedForms = data.filter(p => p.form_completed).length;
                const pending = total - checkedIn;
                setStats({ total, checkedIn, pending, completedForms });
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    {
      title: "סך הכל נסיינים",
      value: stats.total,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "הגיעו",
      value: stats.checkedIn,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "ממתינים",
      value: stats.pending,
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: "השלימו טופס",
      value: stats.completedForms,
      icon: FileCheck,
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl text-slate-900">סטטיסטיקת צ'ק-אין</CardTitle>
        <CardDescription className="text-slate-600">
          עדכון בזמן אמת • נתונים מכל ימי הניסוי
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="relative overflow-hidden rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                <div className="flex items-start justify-between mb-2">
                  <div className={`${stat.bgLight} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${stat.textColor}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>התקדמות צ'ק-אין</span>
            <span>
              {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
              style={{
                width: `${stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
        
        {/* Form completion progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>השלמת טפסים</span>
            <span>
              {stats.checkedIn > 0 ? Math.round((stats.completedForms / stats.checkedIn) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{
                width: `${stats.checkedIn > 0 ? (stats.completedForms / stats.checkedIn) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
