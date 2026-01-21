const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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
  
productSchema.pre('save', async function () {
  if (!this.isNew || this.product_id != null) {
    return;
  }

  const counter = await Counter.findByIdAndUpdate(
    { _id: 'product_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.product_id = counter.seq;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;


