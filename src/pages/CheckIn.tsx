import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Participant {
  id: string;
  full_name: string;
  phone: string;
  age?: number;
  birth_date?: string;
  weight_kg?: number;
  height_cm?: number;
  gender?: string;
  skin_color?: string;
  allergies?: string;
  notes?: string;
  digital_signature?: string;
  form_completed: boolean;
}

const checkInSchema = z.object({
  full_name: z.string().min(1, "שם חובה"),
  age: z.number().min(1, "גיל חובה").max(150, "גיל לא סביר"),
  birth_date: z.string().optional(),
  weight_kg: z.number().min(20, "משקל לא סביר").max(200, "משקל לא סביר"),
  height_cm: z.number().min(100, "גובה לא סביר").max(250, "גובה לא סביר"),
  gender: z.string().min(1, "מין חובה"),
  skin_color: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "צריך להסכים לתנאים",
  }),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

export default function CheckIn() {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      full_name: "",
      age: undefined,
      birth_date: "",
      weight_kg: undefined,
      height_cm: undefined,
      gender: "",
      skin_color: "",
      allergies: "",
      notes: "",
      consent: false,
    },
  });

  // Fetch participant by QR code
  const { data: participant, isLoading, error } = useQuery({
    queryKey: ["check-in", qrId],
    queryFn: async () => {
      if (!qrId) throw new Error("No QR ID provided");

      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("qr_code", qrId)
        .single();

      if (error) throw error;
      return data as Participant;
    },
    enabled: !!qrId,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: CheckInFormData) => {
      if (!participant) throw new Error("Participant not found");

      const { consent, ...updateData } = formData;

      const { error } = await supabase
        .from("participants")
        .update({
          ...updateData,
          form_completed: true,
          form_completed_at: new Date().toISOString(),
          digital_signature: consent ? "agreed" : "",
        })
        .eq("id", participant.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("תודה! הפרטים נקלטו במערכת");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`שגיאה: ${error instanceof Error ? error.message : "unknown"}`);
    },
  });

  const onSubmit = (data: CheckInFormData) => {
    updateMutation.mutate(data);
  };

  // Set default values when participant loads
  useEffect(() => {
    if (participant) {
      setValue("full_name", participant.full_name);
      if (participant.age) setValue("age", participant.age);
      if (participant.birth_date) setValue("birth_date", participant.birth_date);
      if (participant.weight_kg) setValue("weight_kg", participant.weight_kg);
      if (participant.height_cm) setValue("height_cm", participant.height_cm);
      if (participant.gender) setValue("gender", participant.gender);
      if (participant.skin_color) setValue("skin_color", participant.skin_color);
      if (participant.allergies) setValue("allergies", participant.allergies);
      if (participant.notes) setValue("notes", participant.notes);
    }
  }, [participant, setValue]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">שגיאה</h1>
          <p className="text-gray-600 mb-6">
            {error ? "הקוד QR לא תקין או פג תוקף" : "לא נמצא נסיין בקוד זה"}
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            חזור לעמוד הבית
          </Button>
        </div>
      </div>
    );
  }

  if (participant.form_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">טופס כבר מולא</h1>
          <p className="text-gray-600 mb-6">הטופס עבור {participant.full_name} כבר נשלח בהצלחה</p>
          <Button onClick={() => navigate("/")} className="w-full">
            חזור לעמוד הבית
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">טופס מילוי פרטים</h1>
          <p className="text-gray-600 mb-6">שלום {participant.full_name}! בואו נמלא את הפרטים שלך</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name - Read Only */}
            <div>
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                defaultValue={participant.full_name}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">שדה זה קרוא בלבד</p>
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age">
                גיל<span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="150"
                {...register("age", { valueAsNumber: true })}
                placeholder="הכנס גיל"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
            </div>

            {/* Birth Date */}
            <div>
              <Label htmlFor="birth_date">תאריך לידה</Label>
              <Input
                id="birth_date"
                type="date"
                {...register("birth_date")}
              />
            </div>

            {/* Weight */}
            <div>
              <Label htmlFor="weight_kg">
                משקל (ק"ג)<span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight_kg"
                type="number"
                min="20"
                max="200"
                step="0.5"
                {...register("weight_kg", { valueAsNumber: true })}
                placeholder="הכנס משקל בק״ג"
              />
              {errors.weight_kg && <p className="text-red-500 text-sm mt-1">{errors.weight_kg.message}</p>}
            </div>

            {/* Height */}
            <div>
              <Label htmlFor="height_cm">
                גובה (ס"מ)<span className="text-red-500">*</span>
              </Label>
              <Input
                id="height_cm"
                type="number"
                min="100"
                max="250"
                {...register("height_cm", { valueAsNumber: true })}
                placeholder="הכנס גובה בס״מ"
              />
              {errors.height_cm && <p className="text-red-500 text-sm mt-1">{errors.height_cm.message}</p>}
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">
                מין<span className="text-red-500">*</span>
              </Label>
              <Select value={watch("gender")} onValueChange={(value) => setValue("gender", value)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="בחר מין" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">זכר</SelectItem>
                  <SelectItem value="female">נקבה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
            </div>

            {/* Skin Color */}
            <div>
              <Label htmlFor="skin_color">צבע עור</Label>
              <Input
                id="skin_color"
                {...register("skin_color")}
                placeholder="תאר את צבע העור"
              />
            </div>

            {/* Allergies */}
            <div>
              <Label htmlFor="allergies">אלרגיות</Label>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder="תאר כל אלרגיה או רגישות"
                rows={3}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="הערות נוספות"
                rows={3}
              />
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="consent"
                {...register("consent")}
                className="mt-1"
              />
              <div>
                <label htmlFor="consent" className="text-sm font-medium text-gray-900 cursor-pointer">
                  אני מסכים/ה להשתמש בנתונים שלי<span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  אני מאשר/ת שהנתונים שלי יעובדו בהתאם לנוהלי הנסיון
                </p>
              </div>
            </div>
            {errors.consent && <p className="text-red-500 text-sm">{errors.consent.message}</p>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="w-full h-12 text-lg"
            >
              {updateMutation.isPending ? "שולח..." : "שלח טופס"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            הנתונים שלך מוגנים בהצפנה וישמרו בבטחון
          </p>
        </div>
      </div>
    </div>
  );
}
