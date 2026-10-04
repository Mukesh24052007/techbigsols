import { ModulePlaceholder } from "@/components/portal/ModulePlaceholder";

export const metadata = {
  title: "Attendance — User Portal | TechBigSolutions",
  description: "Track and manage employee attendance records.",
};

export default function AttendancePage() {
  return (
    <ModulePlaceholder
      moduleKey="attendance"
      description="Track and manage employee attendance records."
    />
  );
}
