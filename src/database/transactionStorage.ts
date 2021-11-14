import {Connection} from "mongoose";
import {useMongoose} from "./mongo";

export class TransactionStorage {
  private mongo: Connection;
  constructor(connection: Connection) {
    this.mongo = connection
  }

  static async getConnection() {
    return await useMongoose()
  }

  async storeTransaction() {

  }
}