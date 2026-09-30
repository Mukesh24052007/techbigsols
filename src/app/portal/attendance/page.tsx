import MarkAttendance from "@/components/MarkAttendance";

export const metadata = {
  title: "Mark Attendance — Employee Portal | TechBigSolutions",
  description: "Mark your daily attendance with biometric authentication.",
};

export default function PortalAttendancePage() {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Attendance Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">
          Verify your identity with your device biometric or face scan.
        </p>
      </div>
      <MarkAttendance />
    </div>
  );
}
