import Product from "@/models/Product";
import Store from "@/models/Store";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { searchQuery, userPincode } = await req.json();

  try {
    await connectDB();

    const lowercaseSearchQuery = searchQuery.toLowerCase();

    // Find stores with matching pincodes
    // const stores = await Store.find({ 'storeAddress.pincode': { $in: availablePincodes } });
    const stores = await Store.find({
      serviciable_pincodes: { $in: [userPincode] },
    });
    // Extract storeIds from the matching stores
    const storeIds = stores.map((store) => store._id);

    // Fetch products based on approvalStatus and storeIds
    const products = await Product.find({
      approvalStatus: true,
      storeId: { $in: storeIds },
    })
      .select("productName")
      .exec();

    // Create two arrays to store products matching in 'productName' and 'description'
    const matchingName = [];
    const matchingDescription = [];

    products.forEach((product) => {
      const productNameLower = product.productName.toLowerCase();
      // const descriptionLower = product.description.toLowerCase();

      if (productNameLower.includes(lowercaseSearchQuery)) {
        matchingName.push(product);
      }
      //  else if (descriptionLower.includes(lowercaseSearchQuery)) {
      //     matchingDescription.push(product);
      // }
    });

    // Combine results with products from 'productName' appearing first
    const filteredProducts = matchingName.concat(matchingDescription);

    return NextResponse.json({ success: true, products: filteredProducts });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An error occurred while fetching products: " + error,
    });
  }
}
