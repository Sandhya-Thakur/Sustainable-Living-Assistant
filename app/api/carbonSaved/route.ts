import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { carbonFootprintsTable } from "@/lib/db/schema";

// You might want to store these in a configuration file or database
const BASELINE_DAILY_CARBON = 22; // kg CO2e per day (example value)
const DAYS_TO_CONSIDER = 30; // Calculate for the last 30 days

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - DAYS_TO_CONSIDER);

    // Calculate user's total carbon footprint for the last 30 days
    const result = await db
      .select({
        totalCarbon: sql<number>`sum(${carbonFootprintsTable.total})`,
        daysRecorded: sql<number>`count(distinct ${carbonFootprintsTable.date})`,
      })
      .from(carbonFootprintsTable)
      .where(
        and(
          eq(carbonFootprintsTable.userId, userId),
          gte(carbonFootprintsTable.date, startDate.toISOString()),
          lte(carbonFootprintsTable.date, endDate.toISOString())
        )
      )
      .execute();

    const userTotalCarbon = result[0]?.totalCarbon || 0;
    const daysRecorded = result[0]?.daysRecorded || 0;

    // Calculate the baseline carbon footprint for the same period
    const baselineCarbon = BASELINE_DAILY_CARBON * DAYS_TO_CONSIDER;

    // Calculate carbon saved
    const carbonSaved = Math.max(baselineCarbon - userTotalCarbon, 0);

    // Calculate average daily savings
    const avgDailySavings = daysRecorded > 0 ? carbonSaved / daysRecorded : 0;

    return NextResponse.json({
      carbonSaved,
      avgDailySavings,
      daysRecorded,
      timeFrame: DAYS_TO_CONSIDER,
    });
  } catch (error) {
    console.error("Error in GET /api/carbonSaved:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}