import Product from "@/models/Product";
import Store from "@/models/Store";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import Category from "@/models/Category";

export async function POST(request) {
  const searchParams = request.nextUrl.searchParams;
  const filter = searchParams.get("filter");
  const category_id = searchParams.get("category_id");

  try {
    await connectDB();

    let products;

    if (filter) {
      const { userPincode } = await request.json();
      // Find stores with matching pincodes
      const stores = await Store.find({
        serviciable_pincodes: { $in: [userPincode] },
      });
      // Extract storeIds from the matching stores
      const storeIds = stores.map((store) => store._id);
      switch (filter) {
        case "top-deal":
          // Find products belonging to the matching stores
          products = await Product.find({
            topDeal: true,
            approvalStatus: true,
            storeId: { $in: storeIds },
          });

          break;
        case "trending":
          // Find products belonging to the matching stores
          products = await Product.find({
            trending: true,
            approvalStatus: true,
            storeId: { $in: storeIds },
          });

          break;
      }
    } else if (category_id) {
      const { availablePincodes } = await request.json();

      const stores = await Store.find({
        "storeAddress.pincode": { $in: availablePincodes },
      });

      const storeIds = stores.map((store) => store._id);

      const category = await Category.findById(category_id);

      products = await Product.find({
        category: category?.categoryName,
        approvalStatus: true,
        storeId: { $in: storeIds },
      });
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An error occurred while creating the Product: " + error,
    });
  }
}
