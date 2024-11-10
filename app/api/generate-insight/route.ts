import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { carbonFootprintsTable, carbonInsightsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create (POST)
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

    const { date } = await req.json();

    // Fetch the user's carbon footprint data
    const carbonFootprint = await db
      .select()
      .from(carbonFootprintsTable)
      .where(
        and(
          eq(carbonFootprintsTable.userId, userId as string),
          eq(carbonFootprintsTable.date, date)
        )
      )
      .limit(1);

    if (carbonFootprint.length === 0) {
      return NextResponse.json({ error: "Carbon footprint data not found" }, { status: 404 });
    }

    const footprintData = carbonFootprint[0];

    // Generate insight using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in analyzing carbon footprint data and providing actionable short insights. Analyze the given data and provide personalized advice for reducing carbon emissions."
        },
        {
          role: "user",
          content: `Analyze this carbon footprint data and provide insights and tips:
          Date: ${footprintData.date}
          Transportation: ${footprintData.transportation} kg CO2
          Energy: ${footprintData.energy} kg CO2
          Food: ${footprintData.food} kg CO2
          Total: ${footprintData.total} kg CO2`
        }
      ]
    });

    const generatedInsight = completion.choices[0].message.content || "Try to reduce your carbon footprint by using public transportation more often.";

    // Insert insight into database
    const [insertedInsight] = await db
      .insert(carbonInsightsTable)
      .values({
        userId: userId as string,
        carbonFootprintId: footprintData.id,
        date: footprintData.date,
        insight: generatedInsight,
      })
      .returning();

    return NextResponse.json({
      success: true,
      insight: insertedInsight,
    });
  } catch (error) {
    console.error("Error generating insight:", error);
    return NextResponse.json(
      { error: "Failed to generate insight", details: String(error) },
      { status: 500 }
    );
  }
}

// Read (GET)
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    let result;
    if (id) {
      result = await db
        .select()
        .from(carbonInsightsTable)
        .where(
          and(
            eq(carbonInsightsTable.id, parseInt(id)),
            eq(carbonInsightsTable.userId, userId as string)
          )
        )
        .limit(1);
      if (result.length === 0) {
        return NextResponse.json({ error: "Insight not found" }, { status: 404 });
      }
      result = result[0];
    } else {
      result = await db
        .select()
        .from(carbonInsightsTable)
        .where(eq(carbonInsightsTable.userId, userId as string));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights", details: String(error) },
      { status: 500 }
    );
  }
}

// Update (PUT)
export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, insight } = body;

    if (!id || !insight) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await db
      .update(carbonInsightsTable)
      .set({ insight })
      .where(
        and(
          eq(carbonInsightsTable.id, id),
          eq(carbonInsightsTable.userId, userId as string)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating insight:", error);
    return NextResponse.json(
      { error: "Failed to update insight", details: String(error) },
      { status: 500 }
    );
  }
}

// Delete (DELETE)
export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing insight ID" }, { status: 400 });
    }

    const result = await db
      .delete(carbonInsightsTable)
      .where(
        and(
          eq(carbonInsightsTable.id, parseInt(id)),
          eq(carbonInsightsTable.userId, userId as string)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Insight deleted successfully" });
  } catch (error) {
    console.error("Error deleting insight:", error);
    return NextResponse.json(
      { error: "Failed to delete insight", details: String(error) },
      { status: 500 }
    );
  }
}