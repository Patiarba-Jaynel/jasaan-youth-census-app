export interface Youth {
  id?: string;
  name: string;
  sex: typeof enumOptions.sex[number];
  birthdate: string;
  civil_status: typeof enumOptions.civil_status[number];
  barangay: typeof enumOptions.barangay[number];
  purok: string;
  contact_number: string;
  youth_classification: typeof enumOptions.youth_classification[number];
  youth_age_group: typeof enumOptions.youth_age_group[number];
  educational_background: typeof enumOptions.educational_background[number];
  work_status: typeof enumOptions.work_status[number];
  registered_sk_voter: typeof enumOptions.registered_sk_voter[number];
  registered_national_voter: typeof enumOptions.registered_national_voter[number];
  attended_kk_assembly: typeof enumOptions.attended_kk_assembly[number];
  voted_last_sk_election: typeof enumOptions.voted_last_sk_election[number];
  voted_last_national_election: typeof enumOptions.voted_last_national_election[number];
  assembly_attendance: typeof enumOptions.assembly_attendance[number];
  created?: string;
  updated?: string;
}

export const enumOptions = {
  sex: ["MALE", "FEMALE"] as const,
  civil_status: ["SINGLE", "MARRIED", "LIVED-IN", "WIDOWED"] as const,
  youth_classification: ["ISY", "OSY", "WY", "YSN"] as const,
  youth_age_group: ["CORE YOUTH (18-24)", "CHILD YOUTH (15-17)", "YOUNG ADULT (25-30)"] as const,
  educational_background: [
    "ELEMENTARY UNDERGRADUATE",
    "ELEMENTARY GRADUATE", 
    "HIGH SCHOOL UNDERGRADUATE",
    "HIGH SCHOOL GRADUATE",
    "VOCATIONAL UNDERGRADUATE",
    "VOCATIONAL GRADUATE",
    "COLLEGE UNDERGRADUATE",
    "COLLEGE GRADUATE",
    "MASTERAL UNDERGRADUATE",
    "MASTERAL GRADUATE",
    "DOCTORAL UNDERGRADUATE",
    "DOCTORAL GRADUATE"
  ] as const,
  work_status: ["EMPLOYED", "UNEMPLOYED", "STUDENT", "SELF-EMPLOYED"] as const,
  registered_sk_voter: ["YES", "NO"] as const,
  registered_national_voter: ["YES", "NO"] as const,
  attended_kk_assembly: ["YES", "NO"] as const,
  voted_last_sk_election: ["YES", "NO"] as const,
  voted_last_national_election: ["YES", "NO"] as const,
  assembly_attendance: ["NEVER", "SOMETIMES", "ALWAYS"] as const,
  barangay: [
    "APLAYA", "BOBONTUGAN", "CORRALES", "DANSOLIHON", "I. S. CRUZ", "JAMPASON",
    "KIMAYA", "LIGHT HOUSE (POB.)", "LOWER JASAAN", "NATUBO", "SAN ANTONIO",
    "SAN NICOLAS", "SANTA CRUZ", "UPPER JASAAN", "SOLANA"
  ] as const
};
