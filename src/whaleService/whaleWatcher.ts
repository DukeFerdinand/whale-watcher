import {Emoji} from "../constants/emoji";

export class WhaleWatcher {
  public readonly contract;
  constructor(contract: string) {
    this.contract = contract;
  }

  public async getLatestTransactions() {
    console.log('transactions')
  }

  public async logWhale() {
    console.warn(`[Watcher] Found a ${Emoji.WHALE}`)
  }
}