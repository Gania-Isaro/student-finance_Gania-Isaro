export const patterns = {
  description: /^\S(?:.*\S)?$/, 
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/, // money format
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/, // letters, spaces, hyphens
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 
  duplicateWord: /\b(\w+)\s+\1\b/ 
};

// validating
export function validate(field, value) {
  const re = patterns[field];
  if(!re) return true; 
  return re.test(value);
}
