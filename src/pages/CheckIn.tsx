import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TestTube, CheckCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuditLog } from "@/hooks/useAuditLog";

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

type CheckInFormData = {
  full_name: string;
  age: number;
  birth_date?: string;
  weight_kg: number;
  height_cm: number;
  gender: string;
  skin_color?: string;
  allergies?: string;
  notes?: string;
  consent: boolean;
};

const createValidationSchema = (t: any) =>
  z.object({
    full_name: z.string().min(1, t("checkIn.validation.fullNameRequired")),
    age: z.number().min(1, t("checkIn.validation.ageRequired")).max(150, t("checkIn.validation.ageInvalid")),
    birth_date: z.string().optional(),
    weight_kg: z.number().min(20, t("checkIn.validation.weightInvalid")).max(200, t("checkIn.validation.weightInvalid")),
    height_cm: z.number().min(100, t("checkIn.validation.heightInvalid")).max(250, t("checkIn.validation.heightInvalid")),
    gender: z.string().min(1, "Gender required"),
    skin_color: z.string().optional(),
    allergies: z.string().optional(),
    notes: z.string().optional(),
    consent: z.boolean().refine((val) => val === true, {
      message: t("checkIn.validation.consentRequired"),
    }),
  });

export default function CheckIn() {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logAction } = useAuditLog();

  const validationSchema = createValidationSchema(t);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckInFormData>({
    resolver: zodResolver(validationSchema),
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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Participant not found");
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
    onSuccess: async () => {
      // Log the form submission
      try {
        if (participant) {
          await logAction({
            action: 'form_submitted',
            table_name: 'participants',
            record_id: participant.id,
            changes: {},
          });
        }
      } catch (err) {
        console.error('Failed to log audit action:', err);
      }

      // Show success and close form
      toast.success(t("checkIn.success"));
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      toast.error(t("checkIn.error"));
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-blue-400 mb-6"></div>
          <p className="text-white text-lg font-medium">{t("checkIn.loading")}</p>
          <p className="text-slate-300 text-sm mt-2">{t("common.loading")}</p>
          <div className="mt-8">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("common.error")}</h1>
          <p className="text-slate-600 mb-8 text-base">
            {error ? t("checkIn.error") : t("checkIn.notFound")}
          </p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 font-semibold"
          >
            {t("navigation.home")}
          </Button>
          <div className="mt-6">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    );
  }

  if (participant.form_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">✅ {t("checkIn.title")}</h1>
          <p className="text-slate-600 mb-8 text-base">{t("checkIn.success")}</p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11 font-semibold"
          >
            {t("navigation.home")}
          </Button>
          <div className="mt-6">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    );
  }

  const isHebrewOrArabic = i18n.language === 'he' || i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 flex items-center justify-center" dir={isHebrewOrArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-6" dir={isHebrewOrArabic ? 'rtl' : 'ltr'}>
          {/* Language Switcher */}
          <div className="flex justify-end mb-6">
            <LanguageSwitcher />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-block bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-lg mb-4">
              <TestTube className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{t("checkIn.title")}</h1>
            <p className="text-lg text-slate-600">{t("checkIn.subtitle")} {participant.full_name}! 👋</p>
            <p className="text-slate-500 text-sm mt-2">{t("checkIn.subtitle")}</p>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name - Read Only */}
            <div>
              <Label htmlFor="full_name" className="text-slate-900 font-semibold">{t("checkIn.form.fullName")}</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                defaultValue={participant.full_name}
                disabled
                className="bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed mt-2"
              />
              <p className="text-xs text-slate-500 mt-2">👁️ {t("checkIn.form.fullName")}</p>
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age" className="text-slate-900 font-semibold flex items-center gap-1">
                🎂 {t("checkIn.form.age")}<span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="150"
                {...register("age", { valueAsNumber: true })}
                placeholder={t("checkIn.form.age")}
                className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.age && <p className="text-red-600 text-sm mt-2 font-medium">{errors.age.message}</p>}
            </div>

            {/* Weight */}
            <div>
              <Label htmlFor="weight_kg" className="text-slate-900 font-semibold flex items-center gap-1">
                ⚖️ {t("checkIn.form.weight")}<span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight_kg"
                type="number"
                min="20"
                max="200"
                step="0.5"
                {...register("weight_kg", { valueAsNumber: true })}
                placeholder={t("checkIn.form.weight")}
                className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.weight_kg && <p className="text-red-600 text-sm mt-2 font-medium">{errors.weight_kg.message}</p>}
            </div>

            {/* Height */}
            <div>
              <Label htmlFor="height_cm" className="text-slate-900 font-semibold flex items-center gap-1">
                📏 {t("checkIn.form.height")}<span className="text-red-500">*</span>
              </Label>
              <Input
                id="height_cm"
                type="number"
                min="100"
                max="250"
                {...register("height_cm", { valueAsNumber: true })}
                placeholder={t("checkIn.form.height")}
                className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.height_cm && <p className="text-red-600 text-sm mt-2 font-medium">{errors.height_cm.message}</p>}
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-slate-900 font-semibold flex items-center gap-1">
                👤 {t("checkIn.form.gender")}<span className="text-red-500">*</span>
              </Label>
              <Select value={watch("gender")} onValueChange={(value) => setValue("gender", value)}>
                <SelectTrigger id="gender" className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder={t("checkIn.form.gender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">♂️ {t("checkIn.form.male")}</SelectItem>
                  <SelectItem value="female">♀️ {t("checkIn.form.female")}</SelectItem>
                  <SelectItem value="other">⚡ {t("checkIn.form.other")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-600 text-sm mt-2 font-medium">{errors.gender.message}</p>}
            </div>

            {/* Skin Color */}
            <div>
              <Label htmlFor="skin_color" className="text-slate-900 font-semibold flex items-center gap-1">
                🎨 {t("checkIn.form.skinColor")}
              </Label>
              <Input
                id="skin_color"
                {...register("skin_color")}
                placeholder={t("checkIn.form.skinColor")}
                className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                id="consent"
                {...register("consent")}
                className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <div>
                <label htmlFor="consent" className="text-sm font-semibold text-slate-900 cursor-pointer block">
                  {t("checkIn.form.consent")}<span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-slate-600 mt-1">
                  ✓ {t("checkIn.form.consent")}
                </p>
              </div>
            </div>
            {errors.consent && <p className="text-red-600 text-sm font-medium">{errors.consent.message}</p>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {updateMutation.isPending ? `📤 ${t("checkIn.submitting")}` : `✅ ${t("checkIn.submit")}`}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              🔒 {t("checkIn.title")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
