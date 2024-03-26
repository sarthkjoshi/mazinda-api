const mongoose = require("mongoose");

const DeliveryPersonSchema = new mongoose.Schema(
  {
    name: { type: String },
    phoneNumber: { type: Number, unique: true, required: true },
    password: { type: String },
  },
  { timestamps: true }
);

mongoose.models = {};
export default mongoose.model("DeliveryPerson", DeliveryPersonSchema);
