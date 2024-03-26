import connectDB from "@/libs/mongoose";
import { NextResponse } from "next/server";

// import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import DeliveryPerson from "@/models/DeliveryPerson";

export async function POST(req) {
  try {
    const { phoneNumber, password } = await req.json();

    // Connecting to the database
    await connectDB();

    const delivery_person = await DeliveryPerson.findOne({ phoneNumber });

    if (delivery_person) {
      if (password === delivery_person.password) {
        const token = jwt.sign(
          {
            id: delivery_person._id,
            name: delivery_person.name,
            phoneNumber: delivery_person.phoneNumber,
          },
          process.env.SECRET_KEY
        );
        return NextResponse.json(
          {
            success: true,
            message: "Logged in successfully",
            token: token,
            delivery_person,
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid credentials",
          },
          {
            status: 403,
          }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery Person doesn't exist",
        },
        {
          status: 404,
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          "An error occurred while logging in the delivery person: " + error,
      },
      {
        status: 400,
      }
    );
  }
}
