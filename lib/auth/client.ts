export function getFullName(
  firstName: string | null,
  lastName: string | null,
  middleName: string | null = null
): string {
  const parts = [];
  if (firstName) parts.push(firstName);
  if (middleName) parts.push(`${middleName}.`);
  if (lastName) parts.push(lastName);
  return parts.join(" ") || "Unknown User";
}

export function getInitials(
  firstName: string | null,
  lastName: string | null
): string {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${firstInitial}${lastInitial}` || "U";
}
