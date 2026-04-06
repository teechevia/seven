// Seed data for MongoDB Smart Parking System

export const vehiclesSeedData = [
  // Authorized vehicles
  { vehicleNo: "KA 05 MX 7892", owner: "Alex Thompson", type: "Sedan", permitType: "standard", status: "active" },
  { vehicleNo: "DL 22 CD 7890", owner: "Jennifer Lee", type: "Hatchback", permitType: "standard", status: "active" },
  { vehicleNo: "GJ 09 EF 1234", owner: "Maria Garcia", type: "SUV", permitType: "standard", status: "active" },
  { vehicleNo: "KA 01 AB 1234", owner: "John Doe", type: "Sedan", permitType: "standard", status: "active" },
  { vehicleNo: "MH 02 CD 5678", owner: "Sarah Wilson", type: "SUV", permitType: "standard", status: "active" },
  { vehicleNo: "DL 03 EF 9012", owner: "Dr. Mike Chen", type: "Sedan", permitType: "faculty", status: "active" },
  { vehicleNo: "TN 04 GH 3456", owner: "Emily Brown", type: "Hatchback", permitType: "standard", status: "active" },
  { vehicleNo: "GJ 05 IJ 7890", owner: "David Park", type: "SUV", permitType: "standard", status: "active" },
  { vehicleNo: "RJ 06 KL 2345", owner: "Lisa Turner", type: "Sedan", permitType: "standard", status: "active" },
  { vehicleNo: "UP 07 MN 6789", owner: "James Lee", type: "Hatchback", permitType: "standard", status: "active" },
  { vehicleNo: "HR 08 OP 0123", owner: "Prof. Anna White", type: "Sedan", permitType: "faculty", status: "active" },
  { vehicleNo: "MP 09 QR 4567", owner: "Dr. Robert Kim", type: "SUV", permitType: "faculty", status: "active" },
  { vehicleNo: "WB 10 ST 8901", owner: "Chris Johnson", type: "Sedan", permitType: "standard", status: "active" },
  { vehicleNo: "AP 11 UV 2345", owner: "Nancy Davis", type: "Hatchback", permitType: "standard", status: "active" },
  { vehicleNo: "KL 12 WX 6789", owner: "Mark Wilson", type: "SUV", permitType: "standard", status: "active" },
  { vehicleNo: "PB 13 YZ 0123", owner: "Kate Miller", type: "Sedan", permitType: "standard", status: "active" },
  { vehicleNo: "CH 14 AB 4567", owner: "Tom Harris", type: "SUV", permitType: "standard", status: "active" },
  { vehicleNo: "JK 15 CD 8901", owner: "Dr. Sam Clark", type: "Sedan", permitType: "faculty", status: "active" },
  { vehicleNo: "GA 16 EF 2345", owner: "Rachel Green", type: "Hatchback", permitType: "standard", status: "active" },
  // Blacklisted vehicles
  { vehicleNo: "MH 12 XY 9999", owner: "Anonymous", type: "SUV", permitType: "standard", status: "blacklisted", blacklistReason: "Multiple hit-and-run incidents in parking lot", blacklistedBy: "Security Admin" },
  { vehicleNo: "KA 44 AB 0000", owner: "Former Employee", type: "Sedan", permitType: "standard", status: "blacklisted", blacklistReason: "Employment terminated - access revoked", blacklistedBy: "HR Department" },
  { vehicleNo: "TN 66 QQ 5678", owner: "John Smith", type: "Sedan", permitType: "standard", status: "blacklisted", blacklistReason: "Property damage to parking infrastructure", blacklistedBy: "Facility Manager" },
]

export const parkingSlotsSeedData = [
  // Zone A - 8 slots
  { slotId: "A1", zone: "A", status: "occupied", vehicle: { vehicleNo: "KA 01 AB 1234", owner: "John Doe", type: "Sedan" } },
  { slotId: "A2", zone: "A", status: "available" },
  { slotId: "A3", zone: "A", status: "occupied", vehicle: { vehicleNo: "MH 02 CD 5678", owner: "Sarah Wilson", type: "SUV" } },
  { slotId: "A4", zone: "A", status: "reserved", reservedFor: "VIP Guest" },
  { slotId: "A5", zone: "A", status: "available" },
  { slotId: "A6", zone: "A", status: "faculty", vehicle: { vehicleNo: "DL 03 EF 9012", owner: "Dr. Mike Chen", type: "Sedan" } },
  { slotId: "A7", zone: "A", status: "occupied", vehicle: { vehicleNo: "TN 04 GH 3456", owner: "Emily Brown", type: "Hatchback" } },
  { slotId: "A8", zone: "A", status: "available" },
  // Zone B - 8 slots
  { slotId: "B1", zone: "B", status: "available" },
  { slotId: "B2", zone: "B", status: "occupied", vehicle: { vehicleNo: "GJ 05 IJ 7890", owner: "David Park", type: "SUV" } },
  { slotId: "B3", zone: "B", status: "occupied", vehicle: { vehicleNo: "RJ 06 KL 2345", owner: "Lisa Turner", type: "Sedan" } },
  { slotId: "B4", zone: "B", status: "available" },
  { slotId: "B5", zone: "B", status: "reserved", reservedFor: "Management" },
  { slotId: "B6", zone: "B", status: "occupied", vehicle: { vehicleNo: "UP 07 MN 6789", owner: "James Lee", type: "Hatchback" } },
  { slotId: "B7", zone: "B", status: "faculty", vehicle: { vehicleNo: "HR 08 OP 0123", owner: "Prof. Anna White", type: "Sedan" } },
  { slotId: "B8", zone: "B", status: "available" },
  // Zone C - 8 slots
  { slotId: "C1", zone: "C", status: "faculty", vehicle: { vehicleNo: "MP 09 QR 4567", owner: "Dr. Robert Kim", type: "SUV" } },
  { slotId: "C2", zone: "C", status: "occupied", vehicle: { vehicleNo: "WB 10 ST 8901", owner: "Chris Johnson", type: "Sedan" } },
  { slotId: "C3", zone: "C", status: "available" },
  { slotId: "C4", zone: "C", status: "occupied", vehicle: { vehicleNo: "AP 11 UV 2345", owner: "Nancy Davis", type: "Hatchback" } },
  { slotId: "C5", zone: "C", status: "occupied", vehicle: { vehicleNo: "KL 12 WX 6789", owner: "Mark Wilson", type: "SUV" } },
  { slotId: "C6", zone: "C", status: "reserved", reservedFor: "Executive" },
  { slotId: "C7", zone: "C", status: "available" },
  { slotId: "C8", zone: "C", status: "occupied", vehicle: { vehicleNo: "PB 13 YZ 0123", owner: "Kate Miller", type: "Sedan" } },
  // Zone D - 8 slots
  { slotId: "D1", zone: "D", status: "available" },
  { slotId: "D2", zone: "D", status: "available" },
  { slotId: "D3", zone: "D", status: "occupied", vehicle: { vehicleNo: "CH 14 AB 4567", owner: "Tom Harris", type: "SUV" } },
  { slotId: "D4", zone: "D", status: "faculty", vehicle: { vehicleNo: "JK 15 CD 8901", owner: "Dr. Sam Clark", type: "Sedan" } },
  { slotId: "D5", zone: "D", status: "available" },
  { slotId: "D6", zone: "D", status: "occupied", vehicle: { vehicleNo: "GA 16 EF 2345", owner: "Rachel Green", type: "Hatchback" } },
  { slotId: "D7", zone: "D", status: "available" },
  { slotId: "D8", zone: "D", status: "reserved", reservedFor: "Visitor Bay" },
]

export const alertsSeedData = [
  { title: "Unauthorized Vehicle Detected", description: "Slot B-07 - Vehicle without valid permit detected by AI camera", severity: "critical", type: "unauthorized", vehicleNo: "KA 05 MX 9821", location: "Zone B - Slot B7", status: "active" },
  { title: "Overstay Warning", description: "Slot A-15 - Vehicle exceeded maximum 4-hour parking limit", severity: "warning", type: "overstay", vehicleNo: "TN 22 EF 1234", location: "Zone A - Slot A15", status: "active" },
  { title: "Sensor Malfunction", description: "Slot C-22 - Ground proximity sensor offline since 8:45 AM", severity: "critical", type: "sensor", vehicleNo: "System", location: "Zone C - Slot C22", status: "active" },
  { title: "Security Breach Attempt", description: "Gate 2 - Multiple failed access attempts detected", severity: "critical", type: "security", vehicleNo: "MH 12 AB 3456", location: "Zone A - Entry Gate", status: "active" },
  { title: "Battery Low", description: "Zone D sensor array battery below 15%", severity: "warning", type: "maintenance", vehicleNo: "System", location: "Zone D", status: "active" },
]

export const entryLogsSeedData = [
  { vehicleNo: "KA 01 AB 1234", owner: "John Doe", type: "Sedan", assignedSlot: "A1", status: "authorized", confidence: 97.5, gate: "Gate 1 - Main Entry" },
  { vehicleNo: "MH 02 CD 5678", owner: "Sarah Wilson", type: "SUV", assignedSlot: "A3", status: "authorized", confidence: 96.2, gate: "Gate 1 - Main Entry" },
  { vehicleNo: "DL 03 EF 9012", owner: "Dr. Mike Chen", type: "Sedan", assignedSlot: "A6", status: "authorized", confidence: 98.1, gate: "Gate 1 - Main Entry" },
  { vehicleNo: "TN 04 GH 3456", owner: "Emily Brown", type: "Hatchback", assignedSlot: "A7", status: "authorized", confidence: 95.8, gate: "Gate 1 - Main Entry" },
  { vehicleNo: "GJ 05 IJ 7890", owner: "David Park", type: "SUV", assignedSlot: "B2", status: "authorized", confidence: 97.9, gate: "Gate 1 - Main Entry" },
  { vehicleNo: "RJ 06 KL 2345", owner: "Lisa Turner", type: "Sedan", assignedSlot: "B3", status: "authorized", confidence: 98.3, gate: "Gate 2 - West Entry" },
  { vehicleNo: "UP 07 MN 6789", owner: "James Lee", type: "Hatchback", assignedSlot: "B6", status: "authorized", confidence: 98.7, gate: "Gate 1 - Main Entry" },
]
