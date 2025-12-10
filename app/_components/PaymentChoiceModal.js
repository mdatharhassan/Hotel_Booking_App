"use client";

import { useState } from "react";
import SubmitButton from "./SubmitButton";
import { createBooking } from "../_lib/actions";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  { locale: "en" }
);
console.log("Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export default function PaymentChoiceModal({
  isOpen,
  onClose,
  bookingallData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { bookingData, fillData } = bookingallData;
  const normalizedBookingData = {
    ...bookingData,
    startDate: formatDate(bookingData.startDate),
    endDate: formatDate(bookingData.endDate),
  };

  const handlePayNow = async () => {
    setIsLoading(true);
    {
      console.log("Handle Pay Now clicked");
    }
    const stripe = await stripePromise;
    if (!stripe) {
      console.error("❌ Stripe failed to load!");
      setIsLoading(false);
      return;
    }
    const res = await fetch("/api/stripe/checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        normalizedBookingData,
        fillData,
        guestId: session?.user?.guestId,
      }),
      // body: {
      //   bookingData,
      //   fillData,
      //   guestId: session?.user?.guestId,
      // },
    });

    if (!res.ok) {
      console.error("Stripe session error");
      setIsLoading(false);
      return;
    }
    const data = await res.json();
    console.log("Received :", data);
    // const stripe = await stripePromise;
    // console.log("Stripe :", stripe);
    // const result = await stripe.redirectToCheckout({
    //   sessionId: data.sessionId,
    // });
    // if (result.error) {
    //   console.error("Stripe redirect error:", result.error.message);
    // }
    // setIsLoading(false);
    window.location.href = data.url;
  };

  const handlePayOnArrival = async () => {
    try {
      await createBooking(normalizedBookingData, fillData);
      bookingallData.resetRange();
      onClose();
    } catch (err) {
      console.error("Booking failed: ", err);
    }
  };

  return (
    <div className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="text-lg font-bold mb-4">Choose Payment Option</div>

          <button
            onClick={handlePayNow}
            className="bg-green-600 text-white px-4 py-2 rounded w-full mb-4 hover:bg-green-700"
          >
            Pay Now with Card
          </button>

          <button
            onClick={() => {
              console.log("Button Clicked");
              handlePayOnArrival();
            }}
            pendingLabel="Checking..."
            className="bg-gray-800 text-white px-4 py-2 rounded w-full hover:bg-gray-900"
          >
            Pay on Arrival
          </button>
        </div>
      </div>
    </div>
  );
}
