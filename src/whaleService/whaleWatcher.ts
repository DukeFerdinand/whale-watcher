import {Emoji} from "../constants/emoji";
import {GraphQLClient} from 'graphql-request'
import {transactionQuery} from "./queries/transactionQuery";
import {ITransaction} from "../types/transaction";

export class WhaleWatcher {
  public readonly contract;
  public readonly gqlClient;

  constructor(contract: string) {
    const { API_KEY } = process.env
    this.contract = contract;

    if (!API_KEY) {
      throw new Error('[Watcher] Cannot find API_KEY, aborting.')
    }

    this.gqlClient = new GraphQLClient(
      'https://graphql.bitquery.io',
      {
      headers: {
        'X-API-KEY': API_KEY
      }
    })
  }

  public async getLatestTransactions(limit = 1_000): Promise<ITransaction[]> {
    const res = await this.gqlClient.request(
      transactionQuery,
      {
        limit, // Adjust this according to transaction frequency
        contract: process.env.CONTRACT_ADDRESS
      }
    )

    return res?.ethereum?.dexTrades
  }

  public async findWhales(trades: ITransaction[] | undefined) {
    // Buy amount will NOT be undefined but the typedefs say otherwise
    return trades?.filter((t) => (t.buyAmount || 0) >= 500_000_000_000) || []
  }

  public async logWhales(whales: ITransaction[]) {
    if (whales.length === 1) {
      console.warn(`[Watcher] Found a ${Emoji.WHALE} transaction`)
    }

    if (whales.length > 1) {
      console.warn(`[Watcher] Found ${whales.length} ${Emoji.WHALE} transactions!`)
    }
  }
}