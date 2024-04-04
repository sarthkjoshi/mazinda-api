import Product from "@/models/Product";
import Store from "@/models/Store";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
  const searchParams = request.nextUrl.searchParams;
  const searchQuery = searchParams.get("searchQuery");
  const type = searchParams.get("type");

  try {
    await connectDB();

    const { userPincode } = await request.json();

    let query = { serviciable_pincodes: { $in: [userPincode] } };

    if (type === "b2b") {
      query["businessType"] = { $in: ["b2b"] };
    } else if (type === "b2c") {
      query["businessType"] = { $in: ["b2c"] };
    }

    const stores = await Store.find(query);
    console.log(stores.length);
    // Extract storeIds from the matching stores
    const storeIds = stores.map((store) => store._id);

    const products = await Product.find({
      $and: [
        { approvalStatus: true },
        { storeId: { $in: storeIds } },
        {
          $or: [
            { productName: { $regex: searchQuery, $options: "i" } },
            { tags: { $regex: searchQuery, $options: "i" } },
          ],
        },
      ],
    }).exec();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An error occurred while fetching the products: " + error,
    });
  }
}
