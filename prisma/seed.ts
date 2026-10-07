import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMPLOYEES = [
  { id: "tbusr001", name: "Arun Kumar", email: "arun.kumar@techbigsolutions.in", department: "Engineering", method: "Face", checkInTime: "09:08:00", status: "PRESENT" },
  { id: "tbusr002", name: "Priya Nair", email: "priya.nair@techbigsolutions.in", department: "HR", method: "Face", checkInTime: "09:14:00", status: "PRESENT" },
  { id: "tbusr003", name: "Karthik S", email: "karthik.s@techbigsolutions.in", department: "SAP Training", method: "Face", checkInTime: "09:19:00", status: "LATE" },
  { id: "tbusr004", name: "Divya R", email: "divya.r@techbigsolutions.in", department: "Accounts", method: "Face", checkInTime: "09:24:00", status: "PRESENT" },
  { id: "tbusr005", name: "Suresh M", email: "suresh.m@techbigsolutions.in", department: "Hardware", method: "Face", checkInTime: "09:27:00", status: "PRESENT" },
  { id: "tbusr006", name: "Meena L", email: "meena.l@techbigsolutions.in", department: "Engineering", onLeave: true },
  { id: "tbusr007", name: "Vignesh P", email: "vignesh.p@techbigsolutions.in", department: "Logistics", method: "Face", checkInTime: "09:30:00", status: "LATE" },
  { id: "tbusr008", name: "Lakshmi T", email: "lakshmi.t@techbigsolutions.in", department: "Support", method: "Face", checkInTime: "09:33:00", status: "PRESENT" },
  { id: "tbusr009", name: "Rahul D", email: "rahul.d@techbigsolutions.in", department: "Engineering" },
  { id: "tbusr010", name: "Anitha K", email: "anitha.k@techbigsolutions.in", department: "SAP Training" },
  { id: "tbusr011", name: "Bala G", email: "bala.g@techbigsolutions.in", department: "Hardware", onLeave: true },
  { id: "tbusr012", name: "Nisha V", email: "nisha.v@techbigsolutions.in", department: "Accounts" },
] as const;

async function main() {
  console.log("Seeding employee and user master data...");
  const passwordHash = await bcrypt.hash("password123", 10);
  const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  // Create default office location
  const existingOffice = await prisma.officeLocation.findFirst();
  let officeId: string | undefined;
  if (!existingOffice) {
    const office = await prisma.officeLocation.create({
      data: {
        name: "TBS HQ Bangalore",
        lat: 12.9716,
        lng: 77.5946,
        radiusMeters: 150,
        shiftStart: "09:30",
        shiftEnd: "18:30",
        graceMinutes: 10,
        leftPremisesToleranceMinutes: 10,
        heartbeatIntervalSeconds: 60,
        ipAllowlist: "[]",
        isActive: true,
      },
    });
    officeId = office.id;
    console.log(`  Created office: ${office.name} (${office.id})`);
  } else {
    officeId = existingOffice.id;
  }

  for (const emp of EMPLOYEES) {
    // 1. Create or update PortalUser for User Master
    await prisma.portalUser.upsert({
      where: { id: emp.id },
      update: {
        fullname: emp.name,
        email: emp.email,
        moduleAccess: JSON.stringify(["Attendance", "Employee master", "Asset master"]),
        isActive: true,
      },
      create: {
        id: emp.id,
        fullname: emp.name,
        email: emp.email,
        passwordHash,
        moduleAccess: JSON.stringify(["Attendance", "Employee master", "Asset master"]),
        isActive: true,
      },
    });

    // 2. Create or update Employee
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {
        name: emp.name,
        email: emp.email,
        department: emp.department,
        userId: emp.id,
      },
      create: {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        userId: emp.id,
      },
    });

    // 3. Create approved leave if flagged
    if ("onLeave" in emp && emp.onLeave) {
      const existingLeave = await prisma.leave.findFirst({
        where: { employeeId: emp.id, fromDate: { lte: todayIST }, toDate: { gte: todayIST } },
      });
      if (!existingLeave) {
        await prisma.leave.create({
          data: {
            employeeId: emp.id,
            fromDate: todayIST,
            toDate: todayIST,
            reason: "Planned annual leave",
            status: "APPROVED",
          },
        });
      }
    }

    // 4. Create today's attendance record if checked in
    if ("checkInTime" in emp && emp.checkInTime) {
      const existingRec = await prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId: emp.id, date: todayIST } },
      });
      if (!existingRec) {
        // Construct checkIn datetime string for today
        const checkInIso = `${todayIST}T${emp.checkInTime}.000+05:30`;
        const record = await prisma.attendanceRecord.create({
          data: {
            employeeId: emp.id,
            date: todayIST,
            checkIn: new Date(checkInIso),
            method: emp.method || "Face",
            status: emp.status || "PRESENT",
            locationStatus: "INSIDE",
            ip: "127.0.0.1",
            lat: 12.9716,
            lng: 77.5946,
            distanceMeters: 12.5,
            officeLocationId: officeId,
            workedMinutes: 0,
          },
        });

        // Create initial INSIDE presence interval
        await prisma.presenceInterval.create({
          data: {
            recordId: record.id,
            state: "INSIDE",
            startedAt: new Date(checkInIso),
          },
        });
      }
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
