import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const stationSchema = z.object({
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  capacity: z.number().min(1, "קיבולת חייבת להיות לפחות 1"),
  description: z.string().optional(),
});

type Station = {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
};

export default function Stations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const queryClient = useQueryClient();

  const { data: stations, isLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Station[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (station: { name: string; capacity: number; description?: string }) => {
      const { data, error } = await supabase
        .from("stations")
        .insert([station])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("עמדת ניסוי נוצרה בהצלחה");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "שגיאה ביצירת עמדת ניסוי");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...station }: Partial<Station> & { id: string }) => {
      const { data, error } = await supabase
        .from("stations")
        .update(station)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("עמדת ניסוי עודכנה בהצלחה");
      setIsDialogOpen(false);
      setEditingStation(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "שגיאה בעדכון עמדת ניסוי");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("stations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("עמדת ניסוי נמחקה בהצלחה");
    },
    onError: (error: any) => {
      toast.error(error.message || "שגיאה במחיקת עמדת ניסוי");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const stationData = stationSchema.parse({
        name: formData.get("name") as string,
        capacity: parseInt(formData.get("capacity") as string),
        description: formData.get("description") as string,
      }) as { name: string; capacity: number; description?: string };

      if (editingStation) {
        updateMutation.mutate({ id: editingStation.id, ...stationData });
      } else {
        createMutation.mutate(stationData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">עמדות ניסוי</h1>
          <p className="text-muted-foreground">נהל עמדות ניסוי במערכת</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStation(null)}>
              <Plus className="h-4 w-4 ml-2" />
              עמדת ניסוי חדשה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingStation ? "ערוך עמדת ניסוי" : "עמדת ניסוי חדשה"}
                </DialogTitle>
                <DialogDescription>
                  מלא את הפרטים ליצירת עמדת ניסוי חדשה
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם העמדה</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingStation?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">קיבולת</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    defaultValue={editingStation?.capacity}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingStation?.description || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingStation ? "עדכן" : "צור"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations?.map((station, index) => (
            <Card
              key={station.id}
              className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{station.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingStation(station);
                        setIsDialogOpen(true);
                      }}
                      className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("האם אתה בטוח שברצונך למחוק עמדת ניסוי זו?")) {
                          deleteMutation.mutate(station.id);
                        }
                      }}
                      className="hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-destructive transition-transform duration-200 group-hover:scale-110" />
                    </Button>
                  </div>
                </div>
                <CardDescription>קיבולת: {station.capacity}</CardDescription>
              </CardHeader>
              {station.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {station.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
