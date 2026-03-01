import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'phone', 'accessory'
  price: { type: Number, required: true },
  description: String,
  imageUrl: String,
  stock: { type: Number, default: 10 },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;