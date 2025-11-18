import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

const ITEMS_PER_PAGE = 20;

export default function Audit() {
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch audit logs
  const { data: auditLogs, isLoading, isError, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000);
        if (error) {
          console.error("Error fetching audit logs:", error);
          throw error;
        }
        console.log("Audit logs fetched:", data?.length);
        return data as AuditLog[];
      } catch (err) {
        console.error("Exception in audit logs query:", err);
        throw err;
      }
    },
  });

  // Fetch user profiles for joining
  const { data: profiles, isError: isProfilesError, error: profilesError } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("id, full_name");
        if (error) {
          console.error("Error fetching profiles:", error);
          throw error;
        }
        console.log("Profiles fetched:", data?.length);
        return data as UserProfile[];
      } catch (err) {
        console.error("Exception in profiles query:", err);
        throw err;
      }
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

  const formatFullChanges = (changes?: any) => {
    if (!changes) return "-";
    if (typeof changes === "string") {
      try {
        const parsed = JSON.parse(changes);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return changes;
      }
    }
    return JSON.stringify(changes, null, 2);
  };

  const toggleRowExpanded = (logId: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(logId)) {
      newSet.delete(logId);
    } else {
      newSet.add(logId);
    }
    setExpandedRows(newSet);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage]);

  // Reset to first page when filters change
  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  // Show error state if queries failed
  if (isError || isProfilesError) {
    const errorMsg = error?.message || profilesError?.message || "אין לך הרשאות לצפות בלוג האודיט. אנא פנה למנהל המערכת.";
    console.error("Audit page error state - isError:", isError, "isProfilesError:", isProfilesError, "error:", error, "profilesError:", profilesError);
    return (
      <div className="w-full p-6">
        <h1 className="text-3xl font-bold mb-6">לוג אודיט</h1>
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-red-300 bg-red-50">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <p className="text-red-600 font-semibold">שגיאה בטעינת נתונים</p>
          <p className="text-sm text-red-500 mt-2">
            {errorMsg}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 dir-rtl" dir="rtl">
      <BreadcrumbNav items={[{ label: "לוג אודיט" }]} />
      <h1 className="text-3xl font-bold mb-6">לוג אודיט</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <Label htmlFor="filterTable">טבלה</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={filterTable || "all"} onValueChange={(val) => handleFilterChange(setFilterTable, val === "all" ? "" : val)}>
              <SelectTrigger id="filterTable">
                <SelectValue placeholder="בחר טבלה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הטבלאות</SelectItem>
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
            <Select value={filterAction || "all"} onValueChange={(val) => handleFilterChange(setFilterAction, val === "all" ? "" : val)}>
              <SelectTrigger id="filterAction">
                <SelectValue placeholder="בחר פעולה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הפעולות</SelectItem>
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
              onChange={(e) => handleFilterChange(setSearchUserId, e.target.value)}
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
              onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
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
              onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Results Summary and Pagination Info */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <>
              {filteredLogs.length > 0 && (
                <>
                  מציג {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} מתוך {filteredLogs.length} רשומות
                  {auditLogs && filteredLogs.length !== auditLogs.length && (
                    <span> (מסה"כ {auditLogs.length})</span>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
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
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
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
        <React.Fragment>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>משתמש</TableHead>
                    <TableHead>פעולה</TableHead>
                    <TableHead>טבלה</TableHead>
                    <TableHead>ID רשומה</TableHead>
                    <TableHead>שינויים</TableHead>
                    <TableHead>תאריך/שעה</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log, index) => (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-150 animate-fade-in cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => log.changes && toggleRowExpanded(log.id)}
                      >
                        <TableCell>
                          {log.changes && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${expandedRows.has(log.id) ? "rotate-180" : ""}`}
                            />
                          )}
                        </TableCell>
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
                      {expandedRows.has(log.id) && log.changes && (
                        <TableRow className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <TableCell colSpan={7} className="p-4">
                            <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-4">
                              <p className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">שינויים מפורטים:</p>
                              <pre className="text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto max-h-96 overflow-y-auto font-mono">
                                <code className="text-slate-800 dark:text-slate-200">
                                  {formatFullChanges(log.changes)}
                                </code>
                              </pre>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredLogs.length > ITEMS_PER_PAGE && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                עמוד {currentPage} מתוך {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="דף קודם"
                >
                  <ChevronLeft className="h-4 w-4 ml-1" />
                  קודם
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="דף הבא"
                >
                  הבא
                  <ChevronRight className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </div>
          )}
        </React.Fragment>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">אין רשומות התאמות</p>
        </div>
      )}
    </div>
  );
}
