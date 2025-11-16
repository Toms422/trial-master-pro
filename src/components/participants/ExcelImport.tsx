import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { read, utils } from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImportedParticipant {
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
  _error?: string;
  _action?: "skip" | "add" | "update";
}

interface ExcelImportProps {
  trialDayId: string;
  onSuccess: () => void;
}

export default function ExcelImport({ trialDayId, onSuccess }: ExcelImportProps) {
  const [step, setStep] = useState<"upload" | "map" | "preview" | "importing">("upload");
  const [importData, setImportData] = useState<ImportedParticipant[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("הקובץ ריק");
        return;
      }

      // Auto-detect column names
      const headers = Object.keys(jsonData[0] as Record<string, any>);
      const mapping: Record<string, string> = {};

      // Try to auto-map columns
      headers.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (
          lowerHeader.includes("name") ||
          lowerHeader.includes("שם") ||
          lowerHeader.includes("full_name")
        ) {
          mapping["full_name"] = header;
        } else if (
          lowerHeader.includes("phone") ||
          lowerHeader.includes("טלפון") ||
          lowerHeader.includes("call")
        ) {
          mapping["phone"] = header;
        } else if (
          lowerHeader.includes("age") ||
          lowerHeader.includes("גיל")
        ) {
          mapping["age"] = header;
        } else if (
          lowerHeader.includes("birth") ||
          lowerHeader.includes("תאריך לידה")
        ) {
          mapping["birth_date"] = header;
        } else if (lowerHeader.includes("weight") || lowerHeader.includes("משקל")) {
          mapping["weight_kg"] = header;
        } else if (lowerHeader.includes("height") || lowerHeader.includes("גובה")) {
          mapping["height_cm"] = header;
        } else if (lowerHeader.includes("gender") || lowerHeader.includes("מין")) {
          mapping["gender"] = header;
        } else if (lowerHeader.includes("skin") || lowerHeader.includes("צבע")) {
          mapping["skin_color"] = header;
        } else if (lowerHeader.includes("allerg") || lowerHeader.includes("אלרגיה")) {
          mapping["allergies"] = header;
        } else if (lowerHeader.includes("note") || lowerHeader.includes("הערה")) {
          mapping["notes"] = header;
        }
      });

      setColumnMapping(mapping);

      // Parse and validate data
      const parsed: ImportedParticipant[] = jsonData.map((row: any) => {
        const fullName = String(row[mapping["full_name"]] || "").trim();
        const phone = String(row[mapping["phone"]] || "").trim();

        const participant: ImportedParticipant = {
          full_name: fullName,
          phone: phone,
          age: mapping["age"] ? parseInt(row[mapping["age"]]) : undefined,
          birth_date: mapping["birth_date"] ? row[mapping["birth_date"]] : undefined,
          weight_kg: mapping["weight_kg"] ? parseFloat(row[mapping["weight_kg"]]) : undefined,
          height_cm: mapping["height_cm"] ? parseFloat(row[mapping["height_cm"]]) : undefined,
          gender: mapping["gender"] ? String(row[mapping["gender"]]) : undefined,
          skin_color: mapping["skin_color"] ? String(row[mapping["skin_color"]]) : undefined,
          allergies: mapping["allergies"] ? String(row[mapping["allergies"]]) : undefined,
          notes: mapping["notes"] ? String(row[mapping["notes"]]) : undefined,
          _action: "add",
        };

        // Validate
        if (!fullName) participant._error = "שם ריק";
        if (!phone) participant._error = "טלפון ריק";

        return participant;
      });

      setImportData(parsed);
      setStep("preview");
    } catch (error) {
      toast.error(`שגיאה בקריאת הקובץ: ${error instanceof Error ? error.message : "unknown"}`);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  const handleImport = async () => {
    const validData = importData.filter((p) => !p._error);
    if (validData.length === 0) {
      toast.error("אין נתונים תקינים לייבוא");
      return;
    }

    setIsImporting(true);
    try {
      // Check for duplicates
      const phones = validData.map((p) => p.phone);
      const { data: existing } = await supabase
        .from("participants")
        .select("phone")
        .eq("trial_day_id", trialDayId)
        .in("phone", phones);

      const existingPhones = new Set(existing?.map((p) => p.phone) || []);

      // Separate new and duplicate records
      const newRecords = validData
        .filter((p) => !existingPhones.has(p.phone) || p._action === "add")
        .map(({ _error, _action, ...p }) => ({
          ...p,
          trial_day_id: trialDayId,
        }));

      const updateRecords = validData.filter(
        (p) => existingPhones.has(p.phone) && p._action === "update"
      );

      // Insert new records
      if (newRecords.length > 0) {
        const { error: insertError } = await supabase
          .from("participants")
          .insert(newRecords);
        if (insertError) throw insertError;
      }

      // Update existing records
      for (const record of updateRecords) {
        const { _error, _action, ...updateData } = record;
        await supabase
          .from("participants")
          .update(updateData)
          .eq("trial_day_id", trialDayId)
          .eq("phone", record.phone);
      }

      toast.success(`ייובאו ${newRecords.length} נסיינים חדשים`);
      onSuccess();
    } catch (error) {
      toast.error(`שגיאה: ${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium">גרור קובץ Excel כאן</p>
          <p className="text-sm text-gray-500">או לחץ לבחירה (XLSX, XLS, CSV)</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">דרישות קובץ:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>עמודה "שם" או "Full Name" או "Name"</li>
            <li>עמודה "טלפון" או "Phone"</li>
            <li>אופציונלי: גיל, משקל, גובה, מין, צבע עור, אלרגיות, הערות</li>
          </ul>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    const validRows = importData.filter((p) => !p._error);
    const errorRows = importData.filter((p) => p._error);

    return (
      <div className="space-y-4">
        {errorRows.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">{errorRows.length} שורות עם שגיאות</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errorRows.map((row, i) => (
                <li key={i}>
                  שורה {i + 1}: {row._error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-green-800">✓ {validRows.length} שורות תקינות</span>
          </div>
        </div>

        {validRows.length > 0 && (
          <div className="border rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>גיל</TableHead>
                  <TableHead>משקל</TableHead>
                  <TableHead>גובה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validRows.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.full_name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.age || "-"}</TableCell>
                    <TableCell>{row.weight_kg || "-"}</TableCell>
                    <TableCell>{row.height_cm || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {validRows.length > 10 && (
          <p className="text-sm text-gray-500 text-center">מוצגים 10 מתוך {validRows.length} שורות</p>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setStep("upload")}>
            בחר קובץ אחר
          </Button>
          <Button onClick={handleImport} disabled={isImporting || validRows.length === 0}>
            {isImporting ? "מייבא..." : `ייבא ${validRows.length} נסיינים`}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
