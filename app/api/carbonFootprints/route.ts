import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { carbonFootprintsTable } from "@/lib/db/schema";

// Manually defining the CarbonFootprint type based on your schema
export type CarbonFootprint = {
  id?: number; // Auto-generated, optional for insert
  userId: string;
  date: string; // Date in string format (ISO)
  transportation: number;
  energy: number;
  food: number;
  total: number;
  createdAt?: string; // Auto-generated, optional for insert
};

export async function POST(req: Request) {
  console.log("POST request received");
  try {
    const { userId } = auth();
    console.log("Auth userId:", userId);
    if (!userId) {
      console.log("Unauthorized: No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    console.log("Current user:", user);
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    console.log("Request body:", body);

    const { transportation, energy, food, date } = body;

    // Input validation
    if (
      typeof transportation !== "number" ||
      typeof energy !== "number" ||
      typeof food !== "number" ||
      !date
    ) {
      console.log("Invalid input data");
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    const total = transportation + energy + food;

    console.log("Inserting data into database");
    const result = await db
      .insert(carbonFootprintsTable)
      .values({
        userId: userId as string,
        date: new Date(date).toISOString(), // Ensuring the date is in ISO format
        transportation: transportation.toString(), // Convert number to string
        energy: energy.toString(), // Convert number to string
        food: food.toString(), // Convert number to string
        total: total.toString(), // Convert number to string
      })
      .returning();

    console.log("Database insert result:", result);

    if (!result || result.length === 0) {
      console.log("No data returned from database insert");
      return NextResponse.json(
        { error: "Failed to insert data" },
        { status: 500 }
      );
    }

    console.log("Successful POST request");
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error in POST /api/carbonFootprints:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log("GET request received");
  try {
    const { userId } = auth();
    console.log("Auth userId:", userId);
    if (!userId) {
      console.log("Unauthorized: No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    console.log("Current user:", user);
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log("Requested ID:", id);

    let result;
    if (id) {
      console.log("Fetching single record");
      result = await db
        .select()
        .from(carbonFootprintsTable)
        .where(
          and(
            eq(carbonFootprintsTable.id, parseInt(id)),
            eq(carbonFootprintsTable.userId, userId as string)
          )
        )
        .limit(1);
      if (result.length === 0) {
        console.log("Record not found");
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }
      result = result[0];
    } else {
      console.log("Fetching all records for user");
      result = await db
        .select()
        .from(carbonFootprintsTable)
        .where(eq(carbonFootprintsTable.userId, userId as string));
    }

    console.log("Database query result:", result);
    console.log("Successful GET request");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/carbonFootprints:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  console.log("PUT request received");
  try {
    const { userId } = auth();
    console.log("Auth userId:", userId);
    if (!userId) {
      console.log("Unauthorized: No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    console.log("Current user:", user);
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    console.log("Request body:", body);

    const { id, transportation, energy, food, date } = body;

    if (!id) {
      console.log("No ID provided for update");
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Input validation
    if (
      typeof transportation !== "number" ||
      typeof energy !== "number" ||
      typeof food !== "number" ||
      !date
    ) {
      console.log("Invalid input data");
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    const total = transportation + energy + food;

    console.log("Updating data in database");
    const result = await db
      .update(carbonFootprintsTable)
      .set({
        date: new Date(date).toISOString(),
        transportation: transportation.toString(),
        energy: energy.toString(),
        food: food.toString(),
        total: total.toString(),
      })
      .where(
        and(
          eq(carbonFootprintsTable.id, id),
          eq(carbonFootprintsTable.userId, userId as string)
        )
      )
      .returning();

    console.log("Database update result:", result);

    if (!result || result.length === 0) {
      console.log("No record found to update");
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    console.log("Successful PUT request");
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error in PUT /api/carbonFootprints:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  console.log("DELETE request received");
  try {
    const { userId } = auth();
    console.log("Auth userId:", userId);
    if (!userId) {
      console.log("Unauthorized: No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    console.log("Current user:", user);
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log("Record ID to delete:", id);

    if (!id) {
      console.log("No ID provided for deletion");
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    console.log("Deleting record from database");
    const result = await db
      .delete(carbonFootprintsTable)
      .where(
        and(
          eq(carbonFootprintsTable.id, parseInt(id)),
          eq(carbonFootprintsTable.userId, userId as string)
        )
      )
      .returning();

    console.log("Delete operation result:", result);

    if (!result || result.length === 0) {
      console.log("No record found to delete");
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    console.log("Successful DELETE request");
    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/carbonFootprints:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}