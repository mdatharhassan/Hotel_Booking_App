"use server";

import { ObjectId } from "mongodb";
import { auth, signIn, signOut } from "./auth";
import { getBookings } from "./data-service";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbClient } from "./mongodb";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const client = await dbClient;
  try {
    const result = await client
      .db("innsightDB")
      .collection("guests")
      .updateOne(
        { _id: new ObjectId(session.user.guestId) },
        { $set: updateData }
      );
  } catch (error) {
    console.error("message:" + error.message);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}
export async function createBooking(bookingData, formData) {
  console.log(bookingData);
  bookingData = {
    ...bookingData,
    startDate: new Date(`${bookingData.startDate}T00:00:00.000Z`),
    endDate: new Date(`${bookingData.endDate}T00:00:00.000Z`),
  };
  let guestId;
  const session = await auth();

  if (!session) throw new Error("You must be logged in");
  guestId = session.user.guestId;
  const { cabinPrice, ...updatedBookingData } = bookingData;

  const newBooking = {
    ...updatedBookingData,
    guestId,
    numGuests: Number(formData.numGuests),
    observations: (formData.observations || "").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
    created_at: new Date(),
  };

  const client = await dbClient;
  try {
    const result = await client
      .db("innsightDB")
      .collection("bookings")
      .insertOne(newBooking);
  } catch (error) {
    console.log("message:" + error.message);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const bookingObjectId = new ObjectId(bookingId);
  const guestBookingIds = guestBookings.map((booking) => booking._id);
  if (!guestBookingIds.some((id) => id.equals(bookingObjectId))) {
    throw new Error("You are not allowed to delete this booking");
  }

  const client = await dbClient;
  try {
    const result = await client
      .db("innsightDB")
      .collection("bookings")
      .deleteOne({
        _id:
          bookingId instanceof ObjectId ? bookingId : new ObjectId(bookingId),
      });
  } catch (error) {
    console.error("message" + error.message);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = formData.get("bookingId");

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);

  const bookingObjectId = new ObjectId(bookingId);
  const guestBookingIds = guestBookings.map((booking) => booking._id);

  if (!guestBookingIds.some((id) => id.equals(bookingObjectId))) {
    throw new Error("You are not allowed to update this booking");
  }

  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  const client = await dbClient;
  try {
    const result = await client
      .db("innsightDB")
      .collection("bookings")
      .updateOne({ _id: new ObjectId(bookingId) }, { $set: updateData });
  } catch (error) {
    console.error("message:" + error.message);
    throw new Error("Booking could not be updated");
  }

  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
