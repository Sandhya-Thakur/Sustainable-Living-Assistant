import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { waterSavingsTable } from "@/lib/db/schema";

export type WaterSaving = {
  id?: number;
  userId: string;
  date: string;
  amountSaved: number;
  notes?: string;
  createdAt?: string;
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { date, amountSaved, notes } = body;

    if (
      typeof date !== "string" ||
      typeof amountSaved !== "number" ||
      (notes !== undefined && typeof notes !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const result = await db
      .insert(waterSavingsTable)
      .values({
        userId: userId as string,
        date: new Date(date).toISOString(),
        amountSaved,
        notes,
      })
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error in POST /api/waterSavings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    let result;
    if (id) {
      result = await db
        .select()
        .from(waterSavingsTable)
        .where(
          and(
            eq(waterSavingsTable.id, parseInt(id)),
            eq(waterSavingsTable.userId, userId as string)
          )
        )
        .limit(1);
      if (result.length === 0) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }
      result = result[0];
    } else {
      result = await db
        .select()
        .from(waterSavingsTable)
        .where(eq(waterSavingsTable.userId, userId as string));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/waterSavings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, date, amountSaved, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (
      typeof date !== "string" ||
      typeof amountSaved !== "number" ||
      (notes !== undefined && typeof notes !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const result = await db
      .update(waterSavingsTable)
      .set({
        date: new Date(date).toISOString(),
        amountSaved,
        notes,
      })
      .where(
        and(
          eq(waterSavingsTable.id, id),
          eq(waterSavingsTable.userId, userId as string)
        )
      )
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error in PUT /api/waterSavings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const result = await db
      .delete(waterSavingsTable)
      .where(
        and(
          eq(waterSavingsTable.id, parseInt(id)),
          eq(waterSavingsTable.userId, userId as string)
        )
      )
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Water saving entry deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/waterSavings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}