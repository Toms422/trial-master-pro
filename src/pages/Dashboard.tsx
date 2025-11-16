import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, Calendar, Users, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, isAdmin, isOperator } = useAuth();

  const adminCards = [
    {
      title: "עמדות ניסוי",
      description: "נהל עמדות ניסוי קיימות וצור חדשות",
      icon: TestTube,
      href: "/stations",
      color: "text-primary",
    },
    {
      title: "ימי ניסוי",
      description: "תכנן ונהל ימי ניסוי עתידיים",
      icon: Calendar,
      href: "/trial-days",
      color: "text-accent",
    },
    {
      title: "נסיינים",
      description: "צפה ונהל נסיינים רשומים",
      icon: Users,
      href: "/participants",
      color: "text-success",
    },
    {
      title: "יומן ביקורת",
      description: "עיין בפעולות שבוצעו במערכת",
      icon: ClipboardList,
      href: "/audit",
      color: "text-warning",
    },
  ];

  const operatorCards = [
    {
      title: "ימי ניסוי",
      description: "צפה בימי ניסוי ונהל נסיינים",
      icon: Calendar,
      href: "/trial-days",
      color: "text-accent",
    },
    {
      title: "נסיינים",
      description: "סמן הגעות ומלא פרטי נסיין",
      icon: Users,
      href: "/participants",
      color: "text-success",
    },
  ];

  const cards = isAdmin ? adminCards : isOperator ? operatorCards : [];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">שלום, {user?.email}</h1>
        <p className="text-muted-foreground">
          {isAdmin && "אתה מחובר כמנהל מערכת"}
          {isOperator && !isAdmin && "אתה מחובר כמפעיל ניסוי"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} to={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div>
                      <CardTitle>{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {!isAdmin && !isOperator && (
        <Card>
          <CardHeader>
            <CardTitle>אין הרשאות</CardTitle>
            <CardDescription>
              נראה שאין לך הרשאות להשתמש במערכת. אנא פנה למנהל המערכת.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
