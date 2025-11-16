import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "operator" | "qa_viewer";
  created_at: string;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", full_name: "", phone: "", password: "" });
  const [selectedRoles, setSelectedRoles] = useState<Array<"admin" | "operator" | "qa_viewer">>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all users (profiles)
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch all user roles
  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("user_id");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  // Create a map of user -> roles
  const userRolesMap = useMemo(() => {
    const map = new Map<string, Array<"admin" | "operator" | "qa_viewer">>();
    userRoles?.forEach((ur) => {
      const existing = map.get(ur.user_id) || [];
      map.set(ur.user_id, [...existing, ur.role]);
    });
    return map;
  }, [userRoles]);

  // Filter users
  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    return profiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.includes(searchQuery)
    );
  }, [profiles, searchQuery]);

  // Add/Update user mutation
  const upsertUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (editingUserId) {
        // Update profile
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: userData.full_name,
            phone: userData.phone,
          })
          .eq("id", editingUserId);
        if (error) throw error;

        // Update roles
        await supabase.from("user_roles").delete().eq("user_id", editingUserId);
        if (selectedRoles.length > 0) {
          const roleInserts = selectedRoles.map((role) => ({
            user_id: editingUserId,
            role,
          }));
          const { error: roleError } = await supabase.from("user_roles").insert(roleInserts);
          if (roleError) throw roleError;
        }
      } else {
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password || crypto.getRandomValues(new Uint8Array(16)).toString(),
          options: {
            data: {
              full_name: userData.full_name,
              phone: userData.phone,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user?.id && selectedRoles.length > 0) {
          const roleInserts = selectedRoles.map((role) => ({
            user_id: authData.user!.id,
            role,
          }));
          const { error: roleError } = await supabase.from("user_roles").insert(roleInserts);
          if (roleError) throw roleError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast.success(editingUserId ? "משתמש עודכן בהצלחה" : "משתמש נוסף בהצלחה");
      resetForm();
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error instanceof Error ? error.message : "unknown"}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user roles
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Delete profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;

      // Note: Cannot delete from auth.users directly, would need server-side function
      toast.warning("המשתמש נמחק מהמערכת. יש להסיר גם מ-Auth ידנית");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast.success("משתמש נמחק בהצלחה");
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error instanceof Error ? error.message : "unknown"}`);
    },
  });

  const resetForm = () => {
    setFormData({ email: "", full_name: "", phone: "", password: "" });
    setSelectedRoles([]);
    setEditingUserId(null);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (profile?: UserProfile) => {
    if (profile) {
      setEditingUserId(profile.id);
      setFormData({
        email: "",
        full_name: profile.full_name,
        phone: profile.phone || "",
        password: "",
      });
      setSelectedRoles(userRolesMap.get(profile.id) || []);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.full_name) {
      toast.error("חובה למלא שם");
      return;
    }

    if (!editingUserId && !formData.email) {
      toast.error("חובה למלא דוא״ל לחשבון חדש");
      return;
    }

    upsertUserMutation.mutate(formData);
  };

  const handleDelete = (userId: string) => {
    if (confirm("האם בטוח למחוק משתמש זה?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadges = (userId: string) => {
    const roles = userRolesMap.get(userId) || [];
    if (roles.length === 0) return <span className="text-gray-500 text-sm">ללא הרשאות</span>;

    const roleLabels: Record<string, string> = {
      admin: "מנהל",
      operator: "אופרטור",
      qa_viewer: "צופה QA",
    };

    return (
      <div className="flex gap-1 flex-wrap">
        {roles.map((role) => (
          <span key={role} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            {roleLabels[role]}
          </span>
        ))}
      </div>
    );
  };

  if (profilesLoading || rolesLoading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול משתמשים</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 ml-2" />
          משתמש חדש
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          placeholder="חפש לפי שם או טלפון..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
      {filteredProfiles.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם מלא</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>תפקידים</TableHead>
                <TableHead>תאריך הצטרפות</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name}</TableCell>
                  <TableCell>{profile.phone || "-"}</TableCell>
                  <TableCell>{getRoleBadges(profile.id)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(profile.created_at).toLocaleDateString("he-IL")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(profile)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(profile.id)}
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
          <p className="text-muted-foreground">אין משתמשים</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUserId ? "עריכת משתמש" : "משתמש חדש"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!editingUserId && (
              <div>
                <Label htmlFor="email">דוא״ל*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="full_name">שם מלא*</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {!editingUserId && (
              <div>
                <Label htmlFor="password">סיסמה (אופציונלית - תיווצר סיסמה אקראית)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label>תפקידים</Label>
              <div className="space-y-2 mt-2">
                {["admin", "operator", "qa_viewer"].map((role) => (
                  <div key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={selectedRoles.includes(role as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, role as any]);
                        } else {
                          setSelectedRoles(selectedRoles.filter((r) => r !== role));
                        }
                      }}
                    />
                    <label htmlFor={`role-${role}`} className="mr-2 cursor-pointer">
                      {role === "admin" && "מנהל"}
                      {role === "operator" && "אופרטור"}
                      {role === "qa_viewer" && "צופה QA"}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleSave} disabled={upsertUserMutation.isPending}>
                {upsertUserMutation.isPending ? "שומר..." : "שמור"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
