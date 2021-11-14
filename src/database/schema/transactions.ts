import mongoose, {Schema} from "mongoose";

const schema = new Schema({
  name: String
})

export const TransactionModel = mongoose.models['transaction'] || mongoose.model('transaction', schema)