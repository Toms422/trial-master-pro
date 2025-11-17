import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, Calendar, Users, ClipboardList, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import CheckInStatsWidget from "@/components/dashboard/CheckInStatsWidget";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function Dashboard() {
  const { user, isAdmin, isOperator } = useAuth();

  const adminCards = [
    {
      title: "עמדות ניסוי",
      description: "נהל עמדות ניסוי קיימות וצור חדשות",
      icon: TestTube,
      href: "/stations",
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "ימי ניסוי",
      description: "תכנן ונהל ימי ניסוי עתידיים",
      icon: Calendar,
      href: "/trial-days",
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "נסיינים",
      description: "צפה ונהל נסיינים רשומים",
      icon: Users,
      href: "/participants",
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "יומן ביקורת",
      description: "עיין בפעולות שבוצעו במערכת",
      icon: ClipboardList,
      href: "/audit",
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "ניהול משתמשים",
      description: "נהל משתמשים והרשאות",
      icon: Shield,
      href: "/admin",
      gradient: "from-red-500 to-red-600",
      bgLight: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  const operatorCards = [
    {
      title: "ימי ניסוי",
      description: "צפה בימי ניסוי ונהל נסיינים",
      icon: Calendar,
      href: "/trial-days",
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "נסיינים",
      description: "סמן הגעות ומלא פרטי נסיין",
      icon: Users,
      href: "/participants",
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  const cards = isAdmin ? adminCards : isOperator ? operatorCards : [];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            שלום, {user?.email?.split("@")[0]}
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            {isAdmin && "🔐 מנהל מערכת"}
            {isOperator && !isAdmin && "👨‍🔬 מפעיל ניסוי"}
          </p>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
      </div>

      {/* Real-time Stats Widget */}
      <CheckInStatsWidget />

      {/* Activity Feed and Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>

        {/* Cards Grid - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} to={card.href} className="group">
                  <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in">
                    {/* Color Bar */}
                    <div className={`h-1 bg-gradient-to-r ${card.gradient}`}></div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`${card.bgLight} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-6 w-6 ${card.iconColor}`} strokeWidth={2} />
                        </div>
                        <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <CardTitle className="text-xl text-slate-900">{card.title}</CardTitle>
                      <CardDescription className="text-slate-600 text-sm mt-2">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* No Permissions Message */}
      {!isAdmin && !isOperator && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-xl text-amber-900">⚠️ אין הרשאות</CardTitle>
            <CardDescription className="text-amber-800 text-base mt-2">
              נראה שאין לך הרשאות להשתמש במערכת. אנא פנה למנהל המערכת לקבלת גישה.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-200">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">100+</p>
          <p className="text-slate-600 text-sm">נסיינים פעילים</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">24/7</p>
          <p className="text-slate-600 text-sm">זמינות</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">99%</p>
          <p className="text-slate-600 text-sm">שביעות רצון</p>
        </div>
      </div>
    </div>
  );
}
