import {Emoji} from "../constants/emoji";
import {request} from 'graphql-request'
import {transactionQuery} from "./queries/transactionQuery";

export class WhaleWatcher {
  public readonly contract;

  constructor(contract: string) {
    this.contract = contract;
  }

  public async getLatestTransactions() {
    const res = await request('https://graphql.bitquery.io', transactionQuery, {
      limit: 500
    })

    return res?.ethereum?.dexTrades
  }

  public async findWhales(trades: Record<string, number>[] | undefined) {
    return trades?.filter((t) => t.buyAmount >= 500_000_000_000) || []
  }

  public async logWhales(num: number) {
    if (num === 1) {
      console.warn(`[Watcher] Found a ${Emoji.WHALE}`)
    }

    if (num > 1) {
      console.warn(`[Watcher] Found ${num} ${Emoji.WHALE}${Emoji.WHALE}${Emoji.WHALE}`)
    }
  }
}