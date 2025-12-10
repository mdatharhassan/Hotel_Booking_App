import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { normalizedBookingData, fillData, guestId } = await req.json();
  const { cabinPrice, numNights, startDate, endDate, cabinId, name } =
    normalizedBookingData;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:3000/cabins/thankyou`,
      cancel_url: `http://localhost:3000/cabins?id=${cabinId}`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Booking for Cabin ${cabinId}`,
              description: `From ${startDate} to ${endDate}, ${numNights} nights`,
            },
            unit_amount: cabinPrice * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        numGuests: String(fillData.numGuests),
        observations: String(fillData.observations || "None"),
        cabinId: String(cabinId),
        startDate: String(startDate),
        endDate: String(endDate),
        cabinPrice: String(cabinPrice),
        numNights: String(numNights),
        guestId: String(guestId),
        name: String(name),
      },
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Error", err.message);
    return new Response("Internal Server Error", { status: 500 });
  }
}
