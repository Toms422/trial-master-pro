import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, Edit2, Trash2, QrCode, CheckCircle, Download, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import ExcelImport from "@/components/participants/ExcelImport";
import QRCodeDisplay from "@/components/participants/QRCodeDisplay";
import AnimatedBadge from "@/components/AnimatedBadge";
import AnimatedLoadingButton from "@/components/AnimatedLoadingButton";
import { exportParticipantToINI } from "@/lib/iniExport";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useDebounce } from "@/hooks/useDebounce";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

interface TrialDay {
  id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  available_slots: number;
}

interface Station {
  id: string;
  name: string;
  capacity: number;
}

interface Participant {
  id: string;
  trial_day_id: string;
  full_name: string;
  phone: string;
  arrived: boolean;
  arrived_at?: string;
  desired_arrival_time?: string;
  form_completed: boolean;
  form_completed_at?: string;
  trial_completed: boolean;
  trial_completed_at?: string;
  qr_code?: string;
  age?: number;
  birth_date?: string;
  weight_kg?: number;
  height_cm?: number;
  gender?: string;
  skin_color?: string;
  allergies?: string;
  notes?: string;
  digital_signature?: string;
  station_id?: string;
  created_at: string;
  updated_at: string;
  stations?: Station;
}

export default function Participants() {
  const queryClient = useQueryClient();
  const { logAction } = useAuditLog();
  const [selectedTrialDayId, setSelectedTrialDayId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search with 300ms delay
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isQRDisplayOpen, setIsQRDisplayOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>("");
  const [filterArrived, setFilterArrived] = useState<"all" | "yes" | "no">("all");
  const [filterFormCompleted, setFilterFormCompleted] = useState<"all" | "yes" | "no">("all");
  const [filterTrialCompleted, setFilterTrialCompleted] = useState<"all" | "yes" | "no">("all");
  const [filterStation, setFilterStation] = useState<string>("all");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(new Set());
  const [bulkArrivalTime, setBulkArrivalTime] = useState<string>("");
  const [editingArrivalTimeId, setEditingArrivalTimeId] = useState<string | null>(null);
  const [editingArrivalTimeValue, setEditingArrivalTimeValue] = useState<string>("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    notes: "",
    station_id: "",
    desired_arrival_time: "",
  });

  // Fetch trial days
  const { data: trialDays, isLoading: trialDaysLoading } = useQuery({
    queryKey: ["trial-days"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trial_days")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as TrialDay[];
    },
  });

  // Fetch stations
  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stations").select("*").order("name");
      if (error) throw error;
      return data as Station[];
    },
  });

  // Fetch participants for selected trial day
  const { data: allParticipants, isLoading: participantsLoading } = useQuery({
    queryKey: ["participants", selectedTrialDayId],
    queryFn: async () => {
      if (!selectedTrialDayId) return [];
      const { data, error } = await supabase
        .from("participants")
        .select("*, stations(id, name)")
        .eq("trial_day_id", selectedTrialDayId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Participant[];
    },
    enabled: !!selectedTrialDayId,
  });

  // Filter and search participants
  const filteredParticipants = useMemo(() => {
    if (!allParticipants) return [];
    return allParticipants.filter((p) => {
      // Search filter
      const searchMatch = p.full_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        p.phone.includes(debouncedSearchQuery);
      if (!searchMatch) return false;

      // Arrival status filter
      if (filterArrived !== "all") {
        const arrived = filterArrived === "yes" ? true : false;
        if (p.arrived !== arrived) return false;
      }

      // Form completion filter
      if (filterFormCompleted !== "all") {
        const completed = filterFormCompleted === "yes" ? true : false;
        if (p.form_completed !== completed) return false;
      }

      // Trial completion filter
      if (filterTrialCompleted !== "all") {
        const completed = filterTrialCompleted === "yes" ? true : false;
        if (p.trial_completed !== completed) return false;
      }

      // Station filter
      if (filterStation !== "all") {
        const stationId = (p.stations as any)?.id;
        if (filterStation === "unassigned") {
          if (stationId) return false;
        } else {
          if (stationId !== filterStation) return false;
        }
      }

      return true;
    });
  }, [allParticipants, debouncedSearchQuery, filterArrived, filterFormCompleted, filterTrialCompleted, filterStation]);

  // Create/Update participant mutation
  const upsertMutation = useMutation({
    mutationFn: async (participant: Partial<Participant> & { full_name: string; phone: string; trial_day_id: string }) => {
      if (editingParticipant) {
        // For updates, only update specific fields (exclude trial_day_id)
        // Ensure phone is treated as text string, not UUID
        const updateData = {
          full_name: participant.full_name,
          phone: String(participant.phone || ""),
          notes: participant.notes || null,
          station_id: participant.station_id ? participant.station_id : null,
          desired_arrival_time: participant.desired_arrival_time || null,
        };
        const { error } = await supabase
          .from("participants")
          .update(updateData)
          .eq("id", editingParticipant.id);
        if (error) {
          console.error('Supabase update error:', error);
          console.error('Update data:', updateData);
          throw error;
        }
      } else {
        // For inserts, ensure phone is a string and other fields are properly formatted
        const insertData = {
          full_name: participant.full_name,
          phone: String(participant.phone || ""),
          notes: participant.notes || null,
          station_id: participant.station_id ? participant.station_id : null,
          desired_arrival_time: participant.desired_arrival_time || null,
          trial_day_id: participant.trial_day_id,
        };
        const { error } = await supabase.from("participants").insert([insertData]);
        if (error) {
          console.error('Supabase insert error:', error);
          console.error('Insert data:', insertData);
          throw error;
        }
      }
    },
    onSuccess: async () => {
      // Log the action
      try {
        if (editingParticipant) {
          await logAction({
            action: 'updated',
            table_name: 'participants',
            record_id: editingParticipant.id,
            changes: formData,
          });
        } else {
          const participantId = editingParticipant?.id || 'new';
          await logAction({
            action: 'created',
            table_name: 'participants',
            record_id: participantId,
            changes: formData,
          });
        }
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }

      queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
      toast.success(editingParticipant ? "נסיין עודכן בהצלחה" : "נסיין נוסף בהצלחה");
      resetForm();
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Delete participant mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("participants").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      // Log the action
      try {
        await logAction({
          action: 'deleted',
          table_name: 'participants',
          record_id: id,
          changes: {},
        });
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }

      queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
      toast.success("נסיין נמחק בהצלחה");
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Mark arrived mutation
  const markArrivedMutation = useMutation({
    mutationFn: async (id: string) => {
      const qrId = crypto.randomUUID();
      const { error } = await supabase
        .from("participants")
        .update({
          arrived: true,
          arrived_at: new Date().toISOString(),
          qr_code: qrId,
        })
        .eq("id", id);
      if (error) throw error;

      // Fetch participant to get phone and name for WhatsApp message
      const { data: participant } = await supabase
        .from("participants")
        .select("*")
        .eq("id", id)
        .single();

      return { id, qrId, participant };
    },
    onSuccess: async (data) => {
      const { id, qrId, participant } = data;

      // Log the action
      try {
        await logAction({
          action: 'marked_arrived',
          table_name: 'participants',
          record_id: id,
          changes: { arrived: true, qr_code: qrId },
        });
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }

      // Send WhatsApp message with check-in form link
      if (participant?.phone) {
        try {
          sendWhatsAppMessage({
            phoneNumber: participant.phone,
            participantName: participant.full_name,
            messageType: 'check_in_confirmation',
            qrId: qrId,
          });

          // Log WhatsApp message initiation
          try {
            await logAction({
              action: 'whatsapp_sent',
              table_name: 'participants',
              record_id: id,
              changes: { phoneNumber: participant.phone, messageType: 'check_in_confirmation', qrId: qrId },
            });
          } catch (auditErr) {
            console.error('Failed to log WhatsApp audit action:', auditErr);
          }
        } catch (whatsappErr) {
          console.error('Failed to send WhatsApp message:', whatsappErr);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
      toast.success("סמן בהצלחה");
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Mark trial completed mutation
  const markTrialCompletedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("participants")
        .update({
          trial_completed: true,
          trial_completed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      // Log the action
      try {
        await logAction({
          action: 'updated',
          table_name: 'participants',
          record_id: id,
          changes: { trial_completed: true },
        });
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }

      queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
      toast.success("סימון בוצע בהצלחה");
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ full_name: "", phone: "", notes: "", station_id: "" });
    setEditingParticipant(null);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (participant?: Participant) => {
    if (participant) {
      setEditingParticipant(participant);
      setFormData({
        full_name: participant.full_name,
        phone: participant.phone,
        notes: participant.notes || "",
        station_id: participant.station_id || "",
        desired_arrival_time: participant.desired_arrival_time || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.full_name || !formData.phone) {
      toast.error("חובה למלא שם וטלפון");
      return;
    }

    // Ensure phone is a valid string format
    const phoneStr = String(formData.phone).trim();
    if (!phoneStr) {
      toast.error("מספר טלפון לא תקין");
      return;
    }

    upsertMutation.mutate({
      ...formData,
      phone: phoneStr,
      trial_day_id: selectedTrialDayId,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("האם בטוח למחוק נסיין זה?")) {
      deleteMutation.mutate(id);
    }
  };

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const { error } = await supabase
          .from("participants")
          .delete()
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      // Log bulk action
      try {
        await logAction({
          action: 'bulk_deleted',
          table_name: 'participants',
          record_id: 'bulk_delete',
          changes: { count: selectedParticipantIds.size },
        });
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }
      queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
      setSelectedParticipantIds(new Set());
      toast.success(`${selectedParticipantIds.size} נסיינים נמחקו בהצלחה`);
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Bulk arrival time update mutation
  const bulkArrivalTimeMutation = useMutation({
    mutationFn: async ({ ids, arrivalTime }: { ids: string[]; arrivalTime: string }) => {
      for (const id of ids) {
        const { error } = await supabase
          .from("participants")
          .update({ desired_arrival_time: arrivalTime })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      // Log bulk action
      try {
        await logAction({
          action: 'bulk_updated_arrival_time',
          table_name: 'participants',
          record_id: 'bulk_update',
          changes: { count: selectedParticipantIds.size, arrival_time: bulkArrivalTime },
        });
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }
      queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
      setBulkArrivalTime("");
      toast.success(`שעת הגעה עודכנה ל-${selectedParticipantIds.size} נסיינים`);
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Quick arrival time update mutation (for inline editing)
  const quickArrivalTimeUpdateMutation = useMutation({
    mutationFn: async ({ participantId, arrivalTime }: { participantId: string; arrivalTime: string }) => {
      const { error } = await supabase
        .from("participants")
        .update({ desired_arrival_time: arrivalTime })
        .eq("id", participantId);
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
      setEditingArrivalTimeId(null);
      setEditingArrivalTimeValue("");
      toast.success("שעת הגעה עודכנה");
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedParticipantIds.size === 0) {
      toast.error("אנא בחר נסיינים למחיקה");
      return;
    }
    if (confirm(`האם בטוח למחוק ${selectedParticipantIds.size} נסיינים?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedParticipantIds));
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    if (selectedParticipantIds.size === 0) {
      toast.error("אנא בחר נסיינים לייצוא");
      return;
    }
    const selectedParticipants = filteredParticipants.filter((p) => selectedParticipantIds.has(p.id));
    const csvData = selectedParticipants
      .map((p) => `${p.full_name},${p.phone},${p.arrived ? "כן" : "לא"},${p.form_completed ? "כן" : "לא"},${p.trial_completed ? "כן" : "לא"}`)
      .join("\n");
    const headers = "שם מלא,טלפון,הגעה,טופס,ניסוי\n";
    const blob = new Blob([headers + csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `participants_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success(`${selectedParticipantIds.size} נסיינים יוצאו בהצלחה`);
  };

  // Handle bulk arrival time update
  const handleBulkArrivalTimeUpdate = () => {
    if (selectedParticipantIds.size === 0) {
      toast.error("אנא בחר נסיינים לעדכון");
      return;
    }
    if (!bulkArrivalTime) {
      toast.error("אנא בחר שעת הגעה");
      return;
    }
    bulkArrivalTimeMutation.mutate({
      ids: Array.from(selectedParticipantIds),
      arrivalTime: bulkArrivalTime,
    });
  };

  // Toggle participant selection
  const toggleParticipantSelection = (id: string) => {
    const newSet = new Set(selectedParticipantIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedParticipantIds(newSet);
  };

  // Select/Deselect all visible participants
  const toggleSelectAll = () => {
    if (selectedParticipantIds.size === filteredParticipants.length) {
      setSelectedParticipantIds(new Set());
    } else {
      setSelectedParticipantIds(new Set(filteredParticipants.map((p) => p.id)));
    }
  };

  const handleShowQR = (qrCode?: string) => {
    if (qrCode) {
      setSelectedQRCode(qrCode);
      setIsQRDisplayOpen(true);
    }
  };

  // Calculate current participant count for capacity check
  const currentParticipantCount = useMemo(() => {
    return allParticipants?.length || 0;
  }, [allParticipants]);

  const getStatusBadge = (status: boolean, timestamp?: string) => {
    if (status) {
      return (
        <AnimatedBadge variant="success">
          <CheckCircle className="w-3 h-3" />
          <span>כן</span>
          {timestamp && <span className="text-xs ml-2">{new Date(timestamp).toLocaleString("he-IL")}</span>}
        </AnimatedBadge>
      );
    }
    return (
      <AnimatedBadge variant="default">
        לא
      </AnimatedBadge>
    );
  };

  if (trialDaysLoading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

  const selectedTrialDay = trialDays?.find((td) => td.id === selectedTrialDayId);

  // Check if at capacity
  const isAtCapacity = selectedTrialDay && currentParticipantCount >= selectedTrialDay.available_slots;

  // Get capacity percentage for UI
  const capacityPercentage = selectedTrialDay
    ? Math.round((currentParticipantCount / selectedTrialDay.available_slots) * 100)
    : 0;

  return (
    <div className="w-full p-6 dir-rtl" dir="rtl">
      <BreadcrumbNav items={[{ label: "ניהול נסיינים" }]} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול נסיינים</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsExcelImportOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            ייבוא Excel
          </Button>
          <Button
            onClick={() => {
              if (!selectedTrialDayId) {
                toast.error("אנא בחר יום ניסוי קודם לכן");
                return;
              }
              if (isAtCapacity) {
                toast.error("יום הניסוי מלא");
                return;
              }
              handleOpenDialog();
            }}
            disabled={!selectedTrialDayId || isAtCapacity}
          >
            <Plus className="w-4 h-4 ml-2" />
            נסיין חדש
          </Button>
        </div>
      </div>

      {/* Trial Day Selection */}
      <div className="mb-6">
        <Label htmlFor="trial-day-select">בחר יום ניסוי*</Label>
        <Select value={selectedTrialDayId} onValueChange={setSelectedTrialDayId}>
          <SelectTrigger id="trial-day-select">
            <SelectValue placeholder="בחר יום ניסוי" />
          </SelectTrigger>
          <SelectContent>
            {trialDays?.map((td) => (
              <SelectItem key={td.id} value={td.id}>
                {new Date(td.date).toLocaleDateString("he-IL")} ({td.available_slots} מקומות)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTrialDay && (
        <>
          {/* Capacity Indicator */}
          <div className={`mb-4 p-4 border rounded-lg ${isAtCapacity ? 'bg-red-50 border-red-300' : capacityPercentage > 80 ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">נסיינים ביום הניסוי</span>
              <span className={`text-sm font-bold ${isAtCapacity ? 'text-red-700' : capacityPercentage > 80 ? 'text-yellow-700' : 'text-green-700'}`}>
                {currentParticipantCount} / {selectedTrialDay.available_slots} ({capacityPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAtCapacity ? 'bg-red-500' : capacityPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
            {isAtCapacity && (
              <p className="text-xs text-red-700 mt-2">יום הניסוי מלא. לא ניתן להוסיף נסיינים נוספים.</p>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <Input
              placeholder="חפש לפי שם או טלפון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Arrival Status Filter */}
            <div>
              <Label htmlFor="filter-arrived">סטטוס הגעה</Label>
              <Select value={filterArrived} onValueChange={(value: any) => setFilterArrived(value)}>
                <SelectTrigger id="filter-arrived">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כולם</SelectItem>
                  <SelectItem value="yes">הגיע</SelectItem>
                  <SelectItem value="no">לא הגיע</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Form Completion Filter */}
            <div>
              <Label htmlFor="filter-form">סטטוס טופס</Label>
              <Select value={filterFormCompleted} onValueChange={(value: any) => setFilterFormCompleted(value)}>
                <SelectTrigger id="filter-form">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כולם</SelectItem>
                  <SelectItem value="yes">הושלם</SelectItem>
                  <SelectItem value="no">לא הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trial Completion Filter */}
            <div>
              <Label htmlFor="filter-trial">סטטוס ניסוי</Label>
              <Select value={filterTrialCompleted} onValueChange={(value: any) => setFilterTrialCompleted(value)}>
                <SelectTrigger id="filter-trial">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כולם</SelectItem>
                  <SelectItem value="yes">הושלם</SelectItem>
                  <SelectItem value="no">לא הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Station Filter */}
            <div>
              <Label htmlFor="filter-station">עמדה</Label>
              <Select value={filterStation} onValueChange={setFilterStation}>
                <SelectTrigger id="filter-station">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כולן</SelectItem>
                  <SelectItem value="unassigned">לא משוייך</SelectItem>
                  {stations?.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Badge */}
          {(filterArrived !== "all" || filterFormCompleted !== "all" || filterTrialCompleted !== "all" || filterStation !== "all") && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-800">
                סוגנים פעילים: {[filterArrived !== "all" && 1, filterFormCompleted !== "all" && 1, filterTrialCompleted !== "all" && 1, filterStation !== "all" && 1].filter(Boolean).length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterArrived("all");
                  setFilterFormCompleted("all");
                  setFilterTrialCompleted("all");
                  setFilterStation("all");
                  setSearchQuery("");
                }}
              >
                נקה סנני
              </Button>
            </div>
          )}

          {/* Participants Table */}
          {participantsLoading ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם מלא</TableHead>
                    <TableHead>טלפון</TableHead>
                    <TableHead>הגעה</TableHead>
                    <TableHead>טופס</TableHead>
                    <TableHead>ניסוי</TableHead>
                    <TableHead>QR</TableHead>
                    <TableHead>עמדה</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredParticipants.length > 0 ? (
            <>
              {/* Bulk Actions Toolbar */}
              {selectedParticipantIds.size > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedParticipantIds.size} נסיינים נבחרים
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedParticipantIds(new Set())}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={bulkArrivalTime}
                        onChange={(e) => setBulkArrivalTime(e.target.value)}
                        placeholder="שעת הגעה"
                        className="w-32"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkArrivalTimeUpdate}
                        disabled={bulkArrivalTimeMutation.isPending || !bulkArrivalTime}
                      >
                        {bulkArrivalTimeMutation.isPending ? "מעדכן..." : "עדכן שעה"}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkExport}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      ייצוא
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      {bulkDeleteMutation.isPending ? "מוחק..." : "מחק"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedParticipantIds.size === filteredParticipants.length && filteredParticipants.length > 0}
                        onChange={toggleSelectAll}
                        aria-label="בחר/בטל בחירה של כל הנסיינים"
                      />
                    </TableHead>
                    <TableHead>שם מלא</TableHead>
                    <TableHead>טלפון</TableHead>
                    <TableHead>הגעה</TableHead>
                    <TableHead>שעת הגעה רצויה</TableHead>
                    <TableHead>טופס</TableHead>
                    <TableHead>ניסוי</TableHead>
                    <TableHead>QR</TableHead>
                    <TableHead>עמדה</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant, index) => (
                    <TableRow
                      key={participant.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-150 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="w-10">
                        <input
                          type="checkbox"
                          checked={selectedParticipantIds.has(participant.id)}
                          onChange={() => toggleParticipantSelection(participant.id)}
                          aria-label={`בחר ${participant.full_name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{participant.full_name}</TableCell>
                      <TableCell>{participant.phone}</TableCell>
                      <TableCell>{getStatusBadge(participant.arrived, participant.arrived_at)}</TableCell>
                      <TableCell className="text-sm cursor-pointer hover:bg-blue-50">
                        {editingArrivalTimeId === participant.id ? (
                          <input
                            type="time"
                            value={editingArrivalTimeValue}
                            onChange={(e) => setEditingArrivalTimeValue(e.target.value)}
                            onBlur={() => {
                              if (editingArrivalTimeValue) {
                                quickArrivalTimeUpdateMutation.mutate({
                                  participantId: participant.id,
                                  arrivalTime: editingArrivalTimeValue,
                                });
                              } else {
                                setEditingArrivalTimeId(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editingArrivalTimeValue) {
                                quickArrivalTimeUpdateMutation.mutate({
                                  participantId: participant.id,
                                  arrivalTime: editingArrivalTimeValue,
                                });
                              } else if (e.key === "Escape") {
                                setEditingArrivalTimeId(null);
                              }
                            }}
                            autoFocus
                            style={{
                              padding: "0.25rem 0.5rem",
                              border: "1px solid #3b82f6",
                              borderRadius: "0.375rem",
                              width: "100%",
                            }}
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setEditingArrivalTimeId(participant.id);
                              setEditingArrivalTimeValue(participant.desired_arrival_time || "");
                            }}
                          >
                            {participant.desired_arrival_time || "-"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(participant.form_completed, participant.form_completed_at)}</TableCell>
                      <TableCell>{getStatusBadge(participant.trial_completed, participant.trial_completed_at)}</TableCell>
                      <TableCell>
                        {participant.qr_code ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowQR(participant.qr_code)}
                            aria-label={`הצג QR Code עבור ${participant.full_name}`}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{participant.stations?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!participant.arrived && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markArrivedMutation.mutate(participant.id)}
                              disabled={markArrivedMutation.isPending}
                              aria-label={`סמן הגעה עבור ${participant.full_name}`}
                            >
                              ✓ הגעה
                            </Button>
                          )}
                          {participant.form_completed && !participant.trial_completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markTrialCompletedMutation.mutate(participant.id)}
                              disabled={markTrialCompletedMutation.isPending}
                              aria-label={`סמן ניסוי כמושלם עבור ${participant.full_name}`}
                            >
                              ✓ ניסוי
                            </Button>
                          )}
                          {participant.trial_completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const trialDay = trialDays?.find((td) => td.id === participant.trial_day_id);
                                exportParticipantToINI(participant, trialDay);
                              }}
                              aria-label={`הורד נתוני ניסוי עבור ${participant.full_name}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              sendWhatsAppMessage({
                                phoneNumber: participant.phone,
                                participantName: participant.full_name,
                                messageType: 'trial_reminder',
                                qrId: participant.qr_code, // Include QR code for form link
                              });
                            }}
                            aria-label={`שלח WhatsApp ל${participant.full_name}`}
                            disabled={!participant.arrived}
                            title={!participant.arrived ? 'שלח רק לנסיינים שהגיעו' : 'שלח הודעת WhatsApp'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(participant)}
                            aria-label={`ערוך פרטים של ${participant.full_name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(participant.id)}
                            aria-label={`מחק את ${participant.full_name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">אין נסיינים ביום ניסוי זה</p>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParticipant ? "עריכת נסיין" : "נסיין חדש"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">שם מלא*</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">טלפון* (פורמט: 050-1234567)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="050-1234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                pattern="^(?:0[1-9]\d{1}-?\d{7}|0[1-9]\d{8})$"
                title="אנא הזן מספר טלפון תקני (תחילת קידומת עם 0)"
              />
            </div>

            <div>
              <Label htmlFor="notes">הערות</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="desired_arrival_time">שעת הגעה רצויה</Label>
              <Input
                id="desired_arrival_time"
                type="time"
                value={formData.desired_arrival_time}
                onChange={(e) => setFormData({ ...formData, desired_arrival_time: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="station">עמדה (אופציונלי)</Label>
              <Select value={formData.station_id || "unassigned"} onValueChange={(value) => setFormData({ ...formData, station_id: value === "unassigned" ? "" : value })}>
                <SelectTrigger id="station">
                  <SelectValue placeholder="בחר עמדה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">אף עמדה</SelectItem>
                  {stations?.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <AnimatedLoadingButton
                isLoading={upsertMutation.isPending}
                loadingText="שומר..."
                onClick={handleSave}
              >
                שמור
              </AnimatedLoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <Dialog open={isExcelImportOpen} onOpenChange={setIsExcelImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ייבוא נסיינים מ-Excel</DialogTitle>
          </DialogHeader>
          {selectedTrialDayId ? (
            <ExcelImport
              trialDayId={selectedTrialDayId}
              onSuccess={() => {
                setIsExcelImportOpen(false);
                queryClient.invalidateQueries({ queryKey: ["participants", selectedTrialDayId] });
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">בחר יום ניסוי קודם</p>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Display Dialog */}
      <Dialog open={isQRDisplayOpen} onOpenChange={setIsQRDisplayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <QRCodeDisplay qrId={selectedQRCode} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
