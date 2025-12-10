"use server";
import "server-only";
import { eachDayOfInterval } from "date-fns";
import { dbClient } from "./mongodb";
import { ObjectId } from "mongodb";

export async function getCabin(id) {
  const client = await dbClient;

  const cabin = await client
    .db("innsightDB")
    .collection("cabins")
    .findOne({ _id: id instanceof ObjectId ? id : new ObjectId(id) });

  return cabin;
}

export async function getCabinPrice(id) {}

export const getCabins = async function () {
  const client = await dbClient;
  const cabins = await client
    .db("innsightDB")
    .collection("cabins")
    .find({})
    .toArray();
  return cabins;
};

export async function getGuest(email) {
  const client = await dbClient;
  const guest = await client
    .db("innsightDB")
    .collection("guests")
    .findOne({ email: email });

  return guest;
}

export async function getBooking(id) {
  const client = await dbClient;
  const booking = await client
    .db("innsightDB")
    .collection("bookings")
    .findOne({ _id: id instanceof ObjectId ? id : new ObjectId(id) });
  return booking;
}

export async function getBookings(guestId) {
  const client = await dbClient;

  const bookings = await client
    .db("innsightDB")
    .collection("bookings")
    .aggregate([
      { $match: { guestId: guestId } },
      {
        $addFields: {
          cabinIdObj: { $toObjectId: "$cabinId" },
        },
      },
      {
        $lookup: {
          from: "cabins",
          localField: "cabinIdObj",
          foreignField: "_id",
          as: "cabins",
        },
      },

      {
        $project: {
          _id: 1,
          created_at: 1,
          startDate: 1,
          endDate: 1,
          isPaid: 1,
          numNights: 1,
          numGuests: 1,
          totalPrice: 1,
          guestId: 1,
          cabinId: 1,

          "cabins.name": 1,
          "cabins.image": 1,
        },
      },
    ])
    .toArray();

  return bookings;
}

export async function getBookedDatesByCabinId(cabinId) {
  const client = await dbClient;
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const bookings = await client
    .db("innsightDB")
    .collection("bookings")
    .find({
      cabinId: cabinId,
      endDate: { $gte: today },
      status: { $in: ["checked-in", "unconfirmed"] },
    })
    .toArray();

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = bookings
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

export async function getSettings() {
  const client = await dbClient;
  const settings = await client
    .db("innsightDB")
    .collection("settings")
    .findOne({});
  return settings;
}

export async function getCountries() {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags"
    );

    const countries = await res.json();
    return countries;
  } catch {
    throw new Error("Could not fetch countries");
  }
}

export async function createGuest(newGuest) {
  const client = await dbClient;
  const guest = await client
    .db("innsightDB")
    .collection("guests")
    .insertOne(newGuest);
  return guest;
}
