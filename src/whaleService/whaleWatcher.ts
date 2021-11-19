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

  public async getLatestTransactions(limit = 100): Promise<ITransaction[]> {
    const {WHALE_CUTOFF} = process.env
    const res = await this.gqlClient.request(
      transactionQuery,
      {
        limit, // Adjust this according to transaction frequency
        contract: process.env.CONTRACT_ADDRESS,
        whaleAmount: WHALE_CUTOFF ? parseInt(WHALE_CUTOFF) : 500_000_000_000
      }
    )

    return res?.ethereum?.transfers
  }

  public async findWhales(trades: ITransaction[]) {
    // Buy amount will NOT be undefined but the typedefs say otherwise
    return trades
  }

  public async logWhales(_whales: ITransaction[]) {
    // whales.forEach(whale => {
    //   console.info(
    //       whale.sender,
    //       whale.receiver?.smartContract?.contractType
    //   )
    // })

    // console.warn(`[Watcher] Found ${whales.length} ${Emoji.WHALE} transactions!`)
  }
}