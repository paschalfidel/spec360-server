// server/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      // phone = complete handsets
      // accessory = cases, chargers, screen guards, cables
      // part = OEM replacement parts: screens, batteries, charging ports, back glass
      enum: ['phone', 'accessory', 'part'],
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    // Optional: track compatible device models (e.g. "iPhone 14, iPhone 13")
    compatibility: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional: brand tag for filtering (iPhone, Samsung, Tecno, etc.)
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Index for fast category + stock queries
productSchema.index({ category: 1, stock: 1 });
productSchema.index({ name: 'text', description: 'text' }); // full-text search

const Product = mongoose.model('Product', productSchema);
export default Product;
