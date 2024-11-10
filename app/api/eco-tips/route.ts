import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { ecoTipsTable } from "@/lib/db/schema";
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

    // Generate eco tip using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in generating practical and actionable eco-friendly tips. Provide a concise, motivating tip that an individual can easily implement in their daily life."
        },
        {
          role: "user",
          content: "Generate an eco-friendly tip."
        }
      ]
    });
    const generatedTip = completion.choices[0].message.content || "Reduce your plastic waste by using reusable shopping bags.";

    // Generate a category for the tip
    const categoryCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI that categorizes eco-friendly tips. Provide a single word category for the given tip."
        },
        {
          role: "user",
          content: `Categorize this eco tip: ${generatedTip}`
        }
      ]
    });
    const category = categoryCompletion.choices[0].message.content || "General";

    // Generate image based on the tip
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A simple, inspiring image representing the eco-friendly tip: ${generatedTip}`,
      n: 1,
      size: "1024x1024",
    });
    const imageUrl = image.data[0].url;

    // Insert tip into database
    const [insertedTip] = await db
      .insert(ecoTipsTable)
      .values({
        userId: userId as string,
        tip: generatedTip,
        category: category,
        imageUrl: imageUrl,
        isAiGenerated: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      ecoTip: insertedTip,
    });
  } catch (error) {
    console.error("Error generating eco tip:", error);
    return NextResponse.json(
      { error: "Failed to generate eco tip", details: String(error) },
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
        .from(ecoTipsTable)
        .where(
          and(
            eq(ecoTipsTable.id, parseInt(id)),
            eq(ecoTipsTable.userId, userId as string)
          )
        )
        .limit(1);
      if (result.length === 0) {
        return NextResponse.json({ error: "Eco tip not found" }, { status: 404 });
      }
      result = result[0];
    } else {
      result = await db
        .select()
        .from(ecoTipsTable)
        .where(eq(ecoTipsTable.userId, userId as string));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching eco tips:", error);
    return NextResponse.json(
      { error: "Failed to fetch eco tips", details: String(error) },
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
    const { id, tip, category } = body;

    if (!id || !tip || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await db
      .update(ecoTipsTable)
      .set({ tip, category, isAiGenerated: false })
      .where(
        and(
          eq(ecoTipsTable.id, id),
          eq(ecoTipsTable.userId, userId as string)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Eco tip not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating eco tip:", error);
    return NextResponse.json(
      { error: "Failed to update eco tip", details: String(error) },
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
      return NextResponse.json({ error: "Missing eco tip ID" }, { status: 400 });
    }

    const result = await db
      .delete(ecoTipsTable)
      .where(
        and(
          eq(ecoTipsTable.id, parseInt(id)),
          eq(ecoTipsTable.userId, userId as string)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Eco tip not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Eco tip deleted successfully" });
  } catch (error) {
    console.error("Error deleting eco tip:", error);
    return NextResponse.json(
      { error: "Failed to delete eco tip", details: String(error) },
      { status: 500 }
    );
  }
}