
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function standardizeRecordFields(record: Record<string, any>): Record<string, any> {
  const copy = { ...record };

  // Name fields
  if (copy.first_name) copy.first_name = toTitleCase(copy.first_name);
  if (copy.middle_name) copy.middle_name = toTitleCase(copy.middle_name);
  if (copy.last_name) copy.last_name = toTitleCase(copy.last_name);
  if (copy.name) copy.name = toTitleCase(copy.name);

  // Personal information - Force Title Case for sex and civil_status
  if (copy.sex) copy.sex = toTitleCase(copy.sex);
  if (copy.gender) copy.gender = toTitleCase(copy.gender);
  if (copy.civil_status) copy.civil_status = toTitleCase(copy.civil_status);
  if (copy.marital_status) copy.marital_status = toTitleCase(copy.marital_status);

  // Location fields
  if (copy.barangay) copy.barangay = toTitleCase(copy.barangay);
  if (copy.home_address) copy.home_address = toTitleCase(copy.home_address);

  // Education and work
  if (copy.education) copy.education = toTitleCase(copy.education);
  if (copy.highest_education) copy.highest_education = toTitleCase(copy.highest_education);
  if (copy.employment) copy.employment = toTitleCase(copy.employment);
  if (copy.work_status) copy.work_status = toTitleCase(copy.work_status);

  // Birthday formatting
  if (copy.birthday || copy.birthdate) {
    const bday = copy.birthday || copy.birthdate;
    copy.birthday = formatBirthday(bday);
  }

  // Replace empty strings with N/A
  Object.keys(copy).forEach(key => {
    if (copy[key] === "" || copy[key] === null || copy[key] === undefined) {
      copy[key] = "N/A";
    }
  });

  return copy;
}
