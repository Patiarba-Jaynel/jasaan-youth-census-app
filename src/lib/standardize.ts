
export function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatBirthday(input: string): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return input;
  
  // Format as YYYY-MM-DD 00:00:00 (always set time to midnight)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day} 00:00:00`;
}

// Normalize sex values to proper format
export function normalizeSex(value: string): string {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().trim();
  
  if (normalized === "male" || normalized === "m") return "Male";
  if (normalized === "female" || normalized === "f") return "Female";
  
  return toTitleCase(value);
}

// Normalize civil status values
export function normalizeCivilStatus(value: string): string {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().trim();
  
  const statusMap: { [key: string]: string } = {
    "single": "Single",
    "married": "Married", 
    "divorced": "Divorced",
    "widowed": "Widowed",
    "separated": "Separated",
    "lived-in": "Lived-In"
  };
  
  return statusMap[normalized] || toTitleCase(value);
}

// Normalize youth age group values
export function normalizeYouthAgeGroup(value: string): string {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().trim();
  
  const ageGroupMap: { [key: string]: string } = {
    "15-17": "Child Youth (15-17)",
    "child youth": "Child Youth (15-17)",
    "18-24": "Core Youth (18-24)",
    "core youth": "Core Youth (18-24)",
    "25-30": "Young Adult (25-30)",
    "young adult": "Young Adult (25-30)"
  };
  
  return ageGroupMap[normalized] || value;
}

// Normalize education values
export function normalizeEducation(value: string): string {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().trim();
  
  const educationMap: { [key: string]: string } = {
    "elementary": "Elementary Graduate",
    "elem": "Elementary Graduate",
    "high school": "High School Graduate",
    "hs": "High School Graduate",
    "vocational": "Vocational Graduate",
    "voc": "Vocational Graduate",
    "college": "College Graduate",
    "bachelor": "College Graduate",
    "bachelor's": "College Graduate",
    "undergraduate": "College Undergraduate",
    "masters": "Masteral Graduate",
    "master's": "Masteral Graduate",
    "masteral": "Masteral Graduate",
    "doctorate": "Doctoral Graduate",
    "doctoral": "Doctoral Graduate",
    "phd": "Doctoral Graduate"
  };
  
  return educationMap[normalized] || value;
}

// Type-safe standardization for YouthRecord - using any for flexibility
export function standardizeYouthRecord(record: any): any {
  const copy = { ...record };

  // Name fields
  if (copy.name) copy.name = toTitleCase(copy.name);

  // Personal information - Enhanced normalization for sex and civil_status
  if (copy.sex) copy.sex = normalizeSex(copy.sex);
  if (copy.civil_status) copy.civil_status = normalizeCivilStatus(copy.civil_status);

  // Youth-specific normalizations
  if (copy.youth_age_group) copy.youth_age_group = normalizeYouthAgeGroup(copy.youth_age_group);
  if (copy.highest_education) copy.highest_education = normalizeEducation(copy.highest_education);

  // Location fields
  if (copy.barangay) copy.barangay = toTitleCase(copy.barangay);
  if (copy.home_address) copy.home_address = toTitleCase(copy.home_address);

  // Education and work
  if (copy.work_status) copy.work_status = toTitleCase(copy.work_status);

  // Birthday formatting with time
  if (copy.birthday) {
    copy.birthday = formatBirthday(copy.birthday);
  }

  // Replace empty strings with N/A for string fields only
  Object.keys(copy).forEach(key => {
    if (typeof copy[key] === "string" && (copy[key] === "" || copy[key] === null || copy[key] === undefined)) {
      copy[key] = "N/A";
    }
  });

  return copy;
}

// Legacy function for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function standardizeRecordFields(record: Record<string, any>): Record<string, any> {
  return standardizeYouthRecord(record);
}
