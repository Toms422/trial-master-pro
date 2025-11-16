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
  qr_code?: string;
  arrived_at?: string;
  form_completed_at?: string;
  trial_completed_at?: string;
}

interface TrialDay {
  id: string;
  date: string;
  start_time?: string;
  end_time?: string;
}

export function exportParticipantToINI(participant: Participant, trialDay?: TrialDay) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  };

  const iniContent = `[Participant]
ID=${formatValue(participant.id)}
FullName=${formatValue(participant.full_name)}
Phone=${formatValue(participant.phone)}
Age=${formatValue(participant.age)}
BirthDate=${formatValue(participant.birth_date)}
Weight=${formatValue(participant.weight_kg)}
Height=${formatValue(participant.height_cm)}
Gender=${formatValue(participant.gender)}
SkinColor=${formatValue(participant.skin_color)}
Allergies=${formatValue(participant.allergies)}
Notes=${formatValue(participant.notes)}
DigitalSignature=${formatValue(participant.digital_signature)}
QRCode=${formatValue(participant.qr_code)}

[Timestamps]
ArrivedAt=${formatValue(participant.arrived_at)}
FormCompletedAt=${formatValue(participant.form_completed_at)}
TrialCompletedAt=${formatValue(participant.trial_completed_at)}

[TrialDay]
Date=${formatValue(trialDay?.date)}
StartTime=${formatValue(trialDay?.start_time)}
EndTime=${formatValue(trialDay?.end_time)}
`;

  // Create blob and download
  const blob = new Blob([iniContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `participant_${participant.id}.ini`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportParticipantsToINI(participants: Participant[], trialDay?: TrialDay) {
  const sections = participants
    .map((participant) => {
      const formatValue = (value: any): string => {
        if (value === null || value === undefined) {
          return "";
        }
        return String(value);
      };

      return `[Participant_${participant.id}]
ID=${formatValue(participant.id)}
FullName=${formatValue(participant.full_name)}
Phone=${formatValue(participant.phone)}
Age=${formatValue(participant.age)}
BirthDate=${formatValue(participant.birth_date)}
Weight=${formatValue(participant.weight_kg)}
Height=${formatValue(participant.height_cm)}
Gender=${formatValue(participant.gender)}
SkinColor=${formatValue(participant.skin_color)}
Allergies=${formatValue(participant.allergies)}
Notes=${formatValue(participant.notes)}
QRCode=${formatValue(participant.qr_code)}
ArrivedAt=${formatValue(participant.arrived_at)}
FormCompletedAt=${formatValue(participant.form_completed_at)}
TrialCompletedAt=${formatValue(participant.trial_completed_at)}
`;
    })
    .join("\n");

  const headerSection = `[TrialDay]
Date=${formatValue(trialDay?.date)}
StartTime=${formatValue(trialDay?.start_time)}
EndTime=${formatValue(trialDay?.end_time)}
Count=${participants.length}
ExportDate=${new Date().toISOString()}

`;

  const iniContent = headerSection + sections;

  // Create blob and download
  const blob = new Blob([iniContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `participants_${trialDay?.date || "export"}.ini`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}
