import { Schema, model, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IProduct extends Document {
  name: string;
  sku: string;
  quantity: number;
  customFields: Record<string, any>;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  customFields: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

ProductSchema.plugin(mongoosePaginate);

export const Product = model<IProduct>('Product', ProductSchema);
