// admin, legalunit, divisionchief,sectionchief, unithead, monitoring_personnel
export type UserLevel =
  | "admin"
  | "LegalUnit"
  | "DivisionChief"
  | "SectionChief"
  | "UnitHead"
  | "MonitoringPersonnel";

export const ALL_USER_LEVELS: UserLevel[] = [
  "admin",
  "LegalUnit",
  "DivisionChief",
  "SectionChief",
  "UnitHead",
  "MonitoringPersonnel",
];
export const SELECTABLE_USER_LEVELS: UserLevel[] = ALL_USER_LEVELS.filter(
  (level) => level !== "admin"
);
