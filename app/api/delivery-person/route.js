import { NextResponse } from "next/server";
import { headers } from "next/headers";
import connectDB from "@/libs/mongoose";
import DeliveryPerson from "@/models/DeliveryPerson";
import jwt from "jsonwebtoken";

export async function GET() {
  const token = headers().get("authorization");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorised Access" },
      { status: 403 }
    );
  }

  await connectDB();

  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  let delivery_person = await DeliveryPerson.findOne({
    phoneNumber: decoded.phoneNumber,
  });

  if (delivery_person) {
    return NextResponse.json(
      {
        success: true,
        message: "Delivery Person fetched successfully",
        delivery_person,
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      {
        success: false,
        message: "Delivery Person doesn't exist",
      },
      { status: 404 }
    );
  }
}

export async function POST(req) {
  const { name, phoneNumber, password } = await req.json();

  await connectDB();

  let delivery_person = await DeliveryPerson.findOne({ phoneNumber });

  if (!delivery_person) {
    try {
      await DeliveryPerson.create({ name, phoneNumber, password });
      return NextResponse.json(
        { success: true, message: "Delivery Person Created Successfully" },
        { status: 201 }
      );
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while creating the delivery person",
          error: err.message,
        },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      {
        success: false,
        message: "A delivery person with the same phone number already exists",
      },
      { status: 409 }
    );
  }
}
