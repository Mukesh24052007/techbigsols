/**
 * Maps course IDs (used in SapTrainingSection & TechCoursesSection) to their
 * PDF syllabus paths under /public/Syllabus/.
 *
 * Courses WITHOUT a syllabus PDF are intentionally omitted from this map.
 * Missing PDFs to note:
 *   SAP: sap-grc, successfactors
 *   Tech: ms-office, tally, visual-studio, c-cpp, hardware-networking
 */
export const SYLLABUS_PATHS: Record<string, string> = {
  // ── SAP Modules ──────────────────────────────────────────────────────────
  "sap-fico":       "/Syllabus/TECHBIG_Solutions_SAP_S4HANA_FICO_E2E_Syllabus.pdf",
  "sap-sd":         "/Syllabus/TECHBIG_Solutions_SAP_S4HANA_SD_E2E_Syllabus.pdf",
  "sap-mm":         "/Syllabus/TECHBIG_Solutions_SAP_S4HANA_MM_E2E_Syllabus.pdf",
  "sap-wm":         "/Syllabus/TechBig_Solutions_SAP_WM_ECC_Complete_Syllabus.pdf",
  "sap-ewm":        "/Syllabus/TechBig_Solutions_SAP_S4HANA_EWM_Complete_Syllabus.pdf",
  "sap-basis":      "/Syllabus/TechBig_Solutions_SAP_BASIS_S4HANA_AWS_Complete_Syllabus.pdf",
  "sap-abap":       "/Syllabus/TechBig_Solutions_SAP_S4HANA_ABAP_Complete_Syllabus.pdf",
  "sap-hr":         "/Syllabus/TechBig_Solutions_SAP_HCM_S4HANA_E2E_Complete_Syllabus.pdf",
  "sap-payroll":    "/Syllabus/TechBig_Solutions_SAP_S4HANA_Payroll_E2E_Complete_Syllabus.pdf",
  "sap-pp":         "/Syllabus/TechBig_Solutions_SAP_S4HANA_PP_Complete_Syllabus.pdf",
  "sap-qm":         "/Syllabus/TechBig_Solutions_SAP_S4HANA_QM_E2E_Complete_Syllabus.pdf",
  "sap-attp":       "/Syllabus/TechBig_Solutions_SAP_ATTP_Complete_E2E_Syllabus.pdf",
  "sap-apo":        "/Syllabus/TechBig_Solutions_SAP_APO_ECC_E2E_Complete_Syllabus.pdf",
  "sap-security":   "/Syllabus/TechBig_Solutions_SAP_S4HANA_Security_E2E_Complete_Syllabus.pdf",

  // ── Tech / Skill Courses ─────────────────────────────────────────────────
  "python":         "/Syllabus/TechBig_Solutions_Python_Complete_E2E_Syllabus.pdf",
  "oracle":         "/Syllabus/TechBig_Solutions_Oracle_Advanced_Complete_E2E_Syllabus.pdf",
  "advanced-excel": "/Syllabus/TechBig_Solutions_Advanced_Excel_Complete_E2E_Syllabus.pdf",
  "power-bi":       "/Syllabus/TechBig_Solutions_PowerBI_Complete_E2E_Syllabus.pdf",
  "tableau":        "/Syllabus/TechBig_Solutions_Tableau_Complete_E2E_Syllabus.pdf",
  "sql-server":     "/Syllabus/TechBig_Solutions_SQL_Server_Complete_E2E_Syllabus.pdf",
};
