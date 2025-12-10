import Stripe from "stripe";
import { NextResponse } from "next/server";
import { dbClient } from "@/app/_lib/mongodb";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!endpointSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    // Keep the raw bytes intact — constructEvent requires raw bytes (Buffer/Uint8Array)
    const buf = Buffer.from(await req.arrayBuffer());
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error(
      "Webhook signature verification failed:",
      err && err.message ? err.message : err
    );
    return NextResponse.json(
      { error: err && err.message ? err.message : "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const metadata = session.metadata;
    if (!metadata) {
      console.error("❌ No metadata found in Stripe session");
      return NextResponse.json({ error: "No metadata" }, { status: 400 });
    }

    const bookingData = {
      cabinId: metadata.cabinId,
      guestId: metadata.guestId,
      startDate: new Date(`${metadata.startDate}T00:00:00.000Z`),
      endDate: new Date(`${metadata.endDate}T00:00:00.000Z`),
      numNights: Number(metadata.numNights),
      totalPrice: Number(metadata.cabinPrice),
      numGuests: Number(metadata.numGuests),
      name: metadata.name,
    };

    const newBooking = {
      ...bookingData,
      observations: (metadata.observations || "").slice(0, 1000),
      extrasPrice: 0,
      isPaid: true,
      hasBreakfast: false,
      status: "unconfirmed",
      created_at: new Date(),
    };

    try {
      const client = await dbClient;
      await client
        .db("innsightDB")
        .collection("bookings")
        .insertOne(newBooking);
      console.log("Booking inserted successfully");
    } catch (error) {
      console.error("❌ MongoDB insert error:", error);
      return NextResponse.json(
        { error: error.message || "DB error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
