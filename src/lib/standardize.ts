
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
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  });
}

// Normalize sex values to proper format
export function normalizeSex(value: string): string {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().trim();
  
  if (normalized === "male" || normalized === "m") return "MALE";
  if (normalized === "female" || normalized === "f") return "FEMALE";
  
  return toTitleCase(value);
}

// Normalize civil status values
export function normalizeCivilStatus(value: string): string {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().trim();
  
  const statusMap: { [key: string]: string } = {
    "single": "SINGLE",
    "married": "MARRIED", 
    "divorced": "DIVORCED",
    "widowed": "WIDOWED",
    "separated": "SEPARATED",
    "lived-in": "LIVED-IN"
  };
  
  return statusMap[normalized] || toTitleCase(value);
}

// Type-safe standardization for YouthRecord - using any for flexibility
export function standardizeYouthRecord(record: any): any {
  const copy = { ...record };

  // Name fields
  if (copy.name) copy.name = toTitleCase(copy.name);

  // Personal information - Enhanced normalization for sex and civil_status
  if (copy.sex) copy.sex = normalizeSex(copy.sex);
  if (copy.civil_status) copy.civil_status = normalizeCivilStatus(copy.civil_status);

  // Location fields
  if (copy.barangay) copy.barangay = toTitleCase(copy.barangay);
  if (copy.home_address) copy.home_address = toTitleCase(copy.home_address);

  // Education and work
  if (copy.highest_education) copy.highest_education = toTitleCase(copy.highest_education);
  if (copy.work_status) copy.work_status = toTitleCase(copy.work_status);

  // Birthday formatting
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
