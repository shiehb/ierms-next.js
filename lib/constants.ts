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

// Export USER_LEVELS for backward compatibility and consistency
export const USER_LEVELS = ALL_USER_LEVELS;

// User level display names for better UI presentation
export const USER_LEVEL_DISPLAY_NAMES: Record<UserLevel, string> = {
  admin: "Administrator",
  LegalUnit: "Legal Unit",
  DivisionChief: "Division Chief",
  SectionChief: "Section Chief",
  UnitHead: "Unit Head",
  MonitoringPersonnel: "Monitoring Personnel",
};

// User level permissions mapping
export const USER_LEVEL_PERMISSIONS: Record<UserLevel, string[]> = {
  admin: [
    "manage_users",
    "manage_system",
    "view_all_data",
    "manage_establishments",
    "generate_reports",
    "manage_queue",
  ],
  LegalUnit: [
    "view_legal_data",
    "manage_legal_cases",
    "generate_legal_reports",
  ],
  DivisionChief: [
    "view_division_data",
    "manage_division_users",
    "generate_division_reports",
    "approve_requests",
  ],
  SectionChief: [
    "view_section_data",
    "manage_section_users",
    "generate_section_reports",
  ],
  UnitHead: [
    "view_unit_data",
    "manage_unit_personnel",
    "generate_unit_reports",
  ],
  MonitoringPersonnel: [
    "view_monitoring_data",
    "create_monitoring_reports",
    "update_monitoring_status",
  ],
};

// User level hierarchy for access control
export const USER_LEVEL_HIERARCHY: Record<UserLevel, number> = {
  admin: 0,
  DivisionChief: 1,
  SectionChief: 2,
  UnitHead: 3,
  LegalUnit: 4,
  MonitoringPersonnel: 5,
};
