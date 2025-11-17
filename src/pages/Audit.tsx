import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  changes?: any;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
}

export default function Audit() {
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch audit logs
  const { data: auditLogs, isLoading, isError, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  // Fetch user profiles for joining
  const { data: profiles, isError: isProfilesError } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name");
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Create a map for quick lookup
  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles?.forEach((p) => map.set(p.id, p.full_name));
    return map;
  }, [profiles]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!auditLogs) return [];

    return auditLogs.filter((log) => {
      // Filter by table
      if (filterTable && log.table_name !== filterTable) return false;

      // Filter by action
      if (filterAction && log.action !== filterAction) return false;

      // Filter by user (partial match on ID or name)
      if (searchUserId) {
        const userName = profileMap.get(log.user_id) || log.user_id;
        if (!userName.toLowerCase().includes(searchUserId.toLowerCase())) return false;
      }

      // Filter by date range
      const logDate = new Date(log.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });
  }, [auditLogs, filterTable, filterAction, searchUserId, startDate, endDate, profileMap]);

  // Get unique values for filters
  const uniqueTables = useMemo(() => {
    return [...new Set(auditLogs?.map((log) => log.table_name) || [])];
  }, [auditLogs]);

  const uniqueActions = useMemo(() => {
    return [...new Set(auditLogs?.map((log) => log.action) || [])];
  }, [auditLogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getUserName = (userId: string) => {
    return profileMap.get(userId) || userId.substring(0, 8) + "...";
  };

  const formatChanges = (changes?: any) => {
    if (!changes) return "-";
    if (typeof changes === "string") {
      try {
        const parsed = JSON.parse(changes);
        return JSON.stringify(parsed, null, 2).substring(0, 100) + "...";
      } catch {
        return changes.substring(0, 100) + "...";
      }
    }
    return JSON.stringify(changes, null, 2).substring(0, 100) + "...";
  };

  // Show error state if queries failed
  if (isError || isProfilesError) {
    return (
      <div className="w-full p-6">
        <h1 className="text-3xl font-bold mb-6">לוג אודיט</h1>
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-red-300 bg-red-50">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <p className="text-red-600 font-semibold">שגיאה בטעינת נתונים</p>
          <p className="text-sm text-red-500 mt-2">
            {error?.message || "אין לך הרשאות לצפות בלוג האודיט. אנא פנה למנהל המערכת."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-6">לוג אודיט</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <Label htmlFor="filterTable">טבלה</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={filterTable} onValueChange={setFilterTable}>
              <SelectTrigger id="filterTable">
                <SelectValue placeholder="בחר טבלה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">כל הטבלאות</SelectItem>
                {uniqueTables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="filterAction">פעולה</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger id="filterAction">
                <SelectValue placeholder="בחר פעולה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">כל הפעולות</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="searchUserId">משתמש</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="searchUserId"
              placeholder="חפש משתמש..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
            />
          )}
        </div>

        <div>
          <Label htmlFor="startDate">מתאריך</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          )}
        </div>

        <div>
          <Label htmlFor="endDate">עד תאריך</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          `${filteredLogs.length} רשומות מתוך ${auditLogs?.length || 0}`
        )}
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>משתמש</TableHead>
                  <TableHead>פעולה</TableHead>
                  <TableHead>טבלה</TableHead>
                  <TableHead>ID רשומה</TableHead>
                  <TableHead>שינויים</TableHead>
                  <TableHead>תאריך/שעה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>משתמש</TableHead>
                  <TableHead>פעולה</TableHead>
                  <TableHead>טבלה</TableHead>
                  <TableHead>ID רשומה</TableHead>
                  <TableHead>שינויים</TableHead>
                  <TableHead>תאריך/שעה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-150 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>{getUserName(log.user_id)}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.table_name}</TableCell>
                    <TableCell className="font-mono text-xs">{log.record_id ? `${log.record_id.substring(0, 8)}...` : "-"}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 p-2 rounded block max-w-xs overflow-hidden text-ellipsis">
                        {formatChanges(log.changes)}
                      </code>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">אין רשומות התאמות</p>
        </div>
      )}
    </div>
  );
}
