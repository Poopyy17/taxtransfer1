import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    comment: { type: String, required: true },
    image: { type: String }, // Make this field optional
    images: [{ type: String }],
    createdAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        slug: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      image: { type: String, required: true },
      images: [{ type: String }],
      validId: { type: String, required: true },
      recipientName: { type: String, required: true },
      recipientContactNumber: { type: String, required: true }, // New field
      recipientEmail: { type: String, required: true }, // New field
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
    isDeclined: { type: Boolean, default: false },
    declinedAt: { type: Date },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
