import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TrialDay {
  id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  available_slots: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Station {
  id: string;
  name: string;
  capacity: number;
  description?: string;
}

interface TrialDayStation {
  id: string;
  trial_day_id: string;
  station_id: string;
  stations: Station;
}

export default function TrialDays() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrialDay, setEditingTrialDay] = useState<TrialDay | null>(null);
  const [formData, setFormData] = useState({ date: "", start_time: "", end_time: "", available_slots: 0, notes: "" });
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

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

  // Fetch trial day stations for linking
  const { data: trialDayStations } = useQuery({
    queryKey: ["trial-day-stations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trial_day_stations")
        .select("*, stations(id, name)")
        .order("trial_day_id");
      if (error) throw error;
      return data as TrialDayStation[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (trialDay: Omit<TrialDay, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("trial_days")
        .insert([trialDay])
        .select()
        .single();
      if (error) throw error;

      // Add station associations
      if (selectedStations.length > 0) {
        const stationAssociations = selectedStations.map((stationId) => ({
          trial_day_id: data.id,
          station_id: stationId,
        }));
        const { error: assocError } = await supabase
          .from("trial_day_stations")
          .insert(stationAssociations);
        if (assocError) throw assocError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trial-days"] });
      queryClient.invalidateQueries({ queryKey: ["trial-day-stations"] });
      toast.success("יום ניסוי נוצר בהצלחה");
      resetForm();
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (trialDay: TrialDay) => {
      const { data, error } = await supabase
        .from("trial_days")
        .update({
          date: trialDay.date,
          start_time: trialDay.start_time,
          end_time: trialDay.end_time,
          available_slots: trialDay.available_slots,
          notes: trialDay.notes,
        })
        .eq("id", trialDay.id)
        .select()
        .single();
      if (error) throw error;

      // Update station associations
      await supabase.from("trial_day_stations").delete().eq("trial_day_id", trialDay.id);
      if (selectedStations.length > 0) {
        const stationAssociations = selectedStations.map((stationId) => ({
          trial_day_id: trialDay.id,
          station_id: stationId,
        }));
        const { error: assocError } = await supabase
          .from("trial_day_stations")
          .insert(stationAssociations);
        if (assocError) throw assocError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trial-days"] });
      queryClient.invalidateQueries({ queryKey: ["trial-day-stations"] });
      toast.success("יום ניסוי עודכן בהצלחה");
      resetForm();
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trial_days").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trial-days"] });
      toast.success("יום ניסוי נמחק בהצלחה");
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ date: "", start_time: "", end_time: "", available_slots: 0, notes: "" });
    setSelectedStations([]);
    setEditingTrialDay(null);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (trialDay?: TrialDay) => {
    if (trialDay) {
      setEditingTrialDay(trialDay);
      setFormData({
        date: trialDay.date,
        start_time: trialDay.start_time || "",
        end_time: trialDay.end_time || "",
        available_slots: trialDay.available_slots,
        notes: trialDay.notes || "",
      });

      // Load associated stations
      const associated = trialDayStations?.filter((tds) => tds.trial_day_id === trialDay.id) || [];
      setSelectedStations(associated.map((tds) => tds.station_id));
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.date) {
      toast.error("חובה למלא תאריך");
      return;
    }

    if (editingTrialDay) {
      updateMutation.mutate({ ...editingTrialDay, ...formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("האם בטוח למחוק יום ניסוי זה?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStationsForTrialDay = (trialDayId: string) => {
    return trialDayStations?.filter((tds) => tds.trial_day_id === trialDayId) || [];
  };

  if (trialDaysLoading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול ימי ניסוי</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 ml-2" />
          יום ניסוי חדש
        </Button>
      </div>

      {trialDaysLoading ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תאריך</TableHead>
                <TableHead>שעת התחלה</TableHead>
                <TableHead>שעת סיום</TableHead>
                <TableHead>מקומות פנויים</TableHead>
                <TableHead>עמדות</TableHead>
                <TableHead>הערות</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[0, 1, 2, 3, 4].map((i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : trialDays && trialDays.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תאריך</TableHead>
                <TableHead>שעת התחלה</TableHead>
                <TableHead>שעת סיום</TableHead>
                <TableHead>מקומות פנויים</TableHead>
                <TableHead>עמדות</TableHead>
                <TableHead>הערות</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialDays.map((trialDay, index) => {
                const associatedStations = getStationsForTrialDay(trialDay.id);
                return (
                  <TableRow
                    key={trialDay.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-150 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>{new Date(trialDay.date).toLocaleDateString("he-IL")}</TableCell>
                    <TableCell>{trialDay.start_time || "-"}</TableCell>
                    <TableCell>{trialDay.end_time || "-"}</TableCell>
                    <TableCell>{trialDay.available_slots}</TableCell>
                    <TableCell>
                      {associatedStations.length > 0
                        ? associatedStations.map((s) => s.stations.name).join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{trialDay.notes || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(trialDay)}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Edit2 className="w-4 h-4 transition-transform duration-200" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(trialDay.id)}
                          className="hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Trash2 className="w-4 h-4 transition-transform duration-200" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed hover:border-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all duration-300">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">אין ימי ניסוי מוגדרים</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrialDay ? "עריכת יום ניסוי" : "יום ניסוי חדש"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="date">תאריך*</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">שעת התחלה</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">שעת סיום</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="available_slots">מקומות פנויים</Label>
              <Input
                id="available_slots"
                type="number"
                min="0"
                value={formData.available_slots}
                onChange={(e) => setFormData({ ...formData, available_slots: parseInt(e.target.value) || 0 })}
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
              <Label>בחר עמדות</Label>
              <div className="space-y-2 mt-2">
                {stations?.map((station) => (
                  <div key={station.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`station-${station.id}`}
                      checked={selectedStations.includes(station.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStations([...selectedStations, station.id]);
                        } else {
                          setSelectedStations(selectedStations.filter((s) => s !== station.id));
                        }
                      }}
                    />
                    <label htmlFor={`station-${station.id}`} className="mr-2 cursor-pointer">
                      {station.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "שומר..." : "שמור"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
