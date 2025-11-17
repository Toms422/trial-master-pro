import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, Edit2, Trash2, QrCode, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";
import ExcelImport from "@/components/participants/ExcelImport";
import QRCodeDisplay from "@/components/participants/QRCodeDisplay";
import { exportParticipantToINI } from "@/lib/iniExport";
import { useAuditLog } from "@/hooks/useAuditLog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isQRDisplayOpen, setIsQRDisplayOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    notes: "",
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
    return allParticipants.filter((p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
  }, [allParticipants, searchQuery]);

  // Create/Update participant mutation
  const upsertMutation = useMutation({
    mutationFn: async (participant: Partial<Participant> & { full_name: string; phone: string; trial_day_id: string }) => {
      if (editingParticipant) {
        const { error } = await supabase
          .from("participants")
          .update(participant)
          .eq("id", editingParticipant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("participants").insert([participant]);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      // Log the action
      try {
        if (editingParticipant) {
          await logAction({
            action: 'updated',
            tableName: 'participants',
            recordId: editingParticipant.id,
            changes: formData,
          });
        } else {
          const participantId = editingParticipant?.id || 'new';
          await logAction({
            action: 'created',
            tableName: 'participants',
            recordId: participantId,
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
          tableName: 'participants',
          recordId: id,
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
      return id;
    },
    onSuccess: async (id) => {
      // Log the action
      try {
        await logAction({
          action: 'marked_arrived',
          tableName: 'participants',
          recordId: id,
          changes: { arrived: true },
        });
      } catch (err) {
        console.error('Failed to log audit action:', err);
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
          tableName: 'participants',
          recordId: id,
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
    setFormData({ full_name: "", phone: "", notes: "" });
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

    upsertMutation.mutate({
      ...formData,
      trial_day_id: selectedTrialDayId,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("האם בטוח למחוק נסיין זה?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleShowQR = (qrCode?: string) => {
    if (qrCode) {
      setSelectedQRCode(qrCode);
      setIsQRDisplayOpen(true);
    }
  };

  const getStatusBadge = (status: boolean, timestamp?: string) => {
    if (status) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">כן</span>
          {timestamp && <span className="text-xs text-gray-500">{new Date(timestamp).toLocaleString("he-IL")}</span>}
        </div>
      );
    }
    return <span className="text-sm text-gray-500">לא</span>;
  };

  if (trialDaysLoading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

  const selectedTrialDay = trialDays?.find((td) => td.id === selectedTrialDayId);

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול נסיינים</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsExcelImportOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            ייבוא Excel
          </Button>
          <Button onClick={() => handleOpenDialog()}>
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
          {/* Search Bar */}
          <div className="mb-4">
            <Input
              placeholder="חפש לפי שם או טלפון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Participants Table */}
          {participantsLoading ? (
            <div className="flex justify-center items-center p-12">טוען...</div>
          ) : filteredParticipants.length > 0 ? (
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
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.full_name}</TableCell>
                      <TableCell>{participant.phone}</TableCell>
                      <TableCell>{getStatusBadge(participant.arrived, participant.arrived_at)}</TableCell>
                      <TableCell>{getStatusBadge(participant.form_completed, participant.form_completed_at)}</TableCell>
                      <TableCell>{getStatusBadge(participant.trial_completed, participant.trial_completed_at)}</TableCell>
                      <TableCell>
                        {participant.qr_code ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowQR(participant.qr_code)}
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
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(participant)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(participant.id)}
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
              <Label htmlFor="phone">טלפון*</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? "שומר..." : "שמור"}
              </Button>
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
