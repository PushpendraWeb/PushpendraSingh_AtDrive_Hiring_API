const mongoose = require('mongoose');

const orderCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: Number,
      unique: true,
    },
    user_id: {
      type: Number, 
      required: true,
    },
    products: [
      {
        product_id: {
          type: Number, 
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Number, 
      default: null,
    },
    updatedBy: {
      type: Number, 
      default: null,
    },
    DeletedBy: {
      type: Number, 
      default: null,
    },
    DeletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

orderSchema.pre('save', async function () {
  if (!this.isNew || this.order_id != null) {
    return;
  }

  const counter = await OrderCounter.findByIdAndUpdate(
    { _id: 'order_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.order_id = counter.seq;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;


