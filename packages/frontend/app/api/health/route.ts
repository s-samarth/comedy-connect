export const runtime = "nodejs";

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  // Minimal DB touch to prove connectivity
  await prisma.healthCheck.findFirst();

  return NextResponse.json({ status: "ok" });
}