
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateAgeConsistency(age: number, birthday: string, youthAgeGroup: string): ValidationResult {
  const errors: string[] = [];
  
  // Check age vs birthday
  const birthdayDate = new Date(birthday);
  if (!isNaN(birthdayDate.getTime())) {
    const currentYear = new Date().getFullYear();
    const birthYear = birthdayDate.getFullYear();
    const calculatedAge = currentYear - birthYear;
    
    if (Math.abs(age - calculatedAge) > 1) {
      errors.push(`Age (${age}) doesn't match birthday (calculated age: ${calculatedAge})`);
    }
  }
  
  // Check age vs youth age group
  if (youthAgeGroup) {
    const ageGroupRanges: { [key: string]: [number, number] } = {
      "15-17": [15, 17],
      "18-24": [18, 24], 
      "25-30": [25, 30]
    };
    
    const range = ageGroupRanges[youthAgeGroup];
    if (range && (age < range[0] || age > range[1])) {
      errors.push(`Age (${age}) doesn't match age group (${youthAgeGroup})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateDropdownValue(value: string, allowedValues: readonly string[], fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (value && value !== "N/A" && !allowedValues.includes(value as any)) {
    errors.push(`Invalid ${fieldName}: "${value}" (not in allowed options)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
