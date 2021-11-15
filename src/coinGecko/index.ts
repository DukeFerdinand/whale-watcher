import fetch from 'node-fetch'

export interface CoinResponse {
  [key: string]: {
    [k: string]: number,
  },
}

export class CoinGecko {
  private readonly compareAgainst: string | string[]
  private readonly comparisonCoins: string[]

  public currentPrice: CoinResponse = {};

  constructor() {
    const {COIN_GECKO_ID, COIN_GECKO_COMPARISON_COIN} = process.env

    if (!COIN_GECKO_ID) {
      throw new Error('Cannot find COIN_GECKO_ID in env')
    }

    if (!COIN_GECKO_COMPARISON_COIN) {
      throw new Error('Cannot find COIN_GECKO_COMPARISON_COIN in env')
    }

    this.compareAgainst = [COIN_GECKO_COMPARISON_COIN, 'usd']
    this.comparisonCoins = [COIN_GECKO_ID, 'bnb']
  }

  get tokenPriceString() {
    return `https://api.coingecko.com/api/v3/simple/price?ids=${this.comparisonCoins.join(
        ","
    )}&vs_currencies=${
        Array.isArray(this.compareAgainst) ? this.compareAgainst.join(",") : this.compareAgainst
    }`;
  }

  public async getTokenPrices(): Promise<CoinResponse> {
    const res = await fetch(this.tokenPriceString, {
      method: 'GET'
    }).then(res => res.json())

    this.currentPrice = {...res}

    return res
  }
}