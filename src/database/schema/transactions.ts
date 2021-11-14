import mongoose, {Model, Schema} from "mongoose";
import {DatabaseModels} from "../../constants/database";

export interface IStoredTransaction {
  namespace: string;
  hash: string;
}

const schema = new Schema<IStoredTransaction>({
  namespace: String,
  hash: String
})

export const TransactionModel: Model<IStoredTransaction> =
    mongoose.models[DatabaseModels.Transaction] || mongoose.model(DatabaseModels.Transaction, schema)