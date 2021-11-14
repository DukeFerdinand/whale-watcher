import {Connection} from "mongoose";
import {useMongoose} from "./mongo";
import {IStoredTransaction, TransactionModel} from "./schema/transactions";

export class TransactionStorage {
  private mongo: Connection;
  private readonly namespace: string;

  constructor(namespace: string, connection: Connection) {
    this.namespace = namespace
    this.mongo = connection
  }

  static async getConnection() {
    return await useMongoose()
  }

  private async storeTransactions(hashes: string[]) {
    await TransactionModel.insertMany(hashes.map(h => ({
      hash: h,
      namespace: this.namespace
    })))
  }

  async storeNewTransactions(hashes: string[]): Promise<string[]> {
    const existing = await TransactionModel.find({
      $or: hashes.map(h => ({ namespace: this.namespace, hash: h } as Partial<IStoredTransaction>))
    })
    const existingHashes = existing.map((e) => e.hash)

    const hashesToSave: string[] = []
    for (const hash of hashes) {
      // Hash does not exists
      if (!existingHashes.includes(hash)) {
        hashesToSave.push(hash)
      }
    }

    // Bulk storing is much cheaper than round-tripping every new document
    await this.storeTransactions(hashesToSave)

    // Returns the newly inserted hashes
    return hashesToSave
  }
}