import {MessageEmbed} from "discord.js";
import {Emoji} from "../../constants/emoji";
import {ITransaction} from "../../types/transaction";

type BuySell = {
  [key in 'mainToken' | 'secondaryToken']: {
    symbol?: string;
    amount?: string;
    usdAmount?: string;
  }
} & {
  actionType: 'sell' | 'buy';
}

const formatBuySell = (tr: ITransaction): BuySell => {
  const isBuyAction = tr.buyCurrency?.symbol === process.env.COIN_SYMBOL
  const buy = {
    symbol: tr.buyCurrency?.symbol,
    amount: tr.buyAmount?.toLocaleString(),
    usdAmount: tr.buyAmountInUsd.toLocaleString()
  }
  const sell: BuySell['secondaryToken'] = {
    symbol: tr.sellCurrency?.symbol,
    amount: tr.sellAmount?.toLocaleString(),
    usdAmount: tr.sellAmountInUsd.toLocaleString()
  }
  const main = isBuyAction ? buy : sell
  const secondary = isBuyAction ? sell : buy
  return {
    mainToken: main,
    secondaryToken: secondary,
    actionType: isBuyAction ? 'buy' : 'sell'
  }
}

export const createWhaleEmbed = (whale: ITransaction) => {
  let {COIN_SYMBOL} = process.env;
  if (!COIN_SYMBOL) {
    COIN_SYMBOL = whale.buyCurrency?.symbol || ''
  }

  const details = formatBuySell(whale)
  const action = details.actionType === 'buy' ? 'Buy' : 'Sell'

  return new MessageEmbed({
    title: `${Emoji.WHALE} Whale ${action} alert`,
    description: `<From address in next release>`,
    fields: [
      {
        name: `Amount (${details.mainToken.symbol})`,
        value: `${details.mainToken.amount || 'N/A'}`,
        inline: false,
      },
      {
        name: 'Amount (USD)',
        value: `$${details.mainToken.usdAmount || 'N/A'}`,
        inline: true,
      },
      {
        name: `Amount (${details.secondaryToken.symbol})`,
        value: `${details.secondaryToken.amount || 'N/A'} ${details.secondaryToken.symbol}`,
        inline: true,
      },
      {
        name: 'BSCScan Link',
        value: `https://bscscan.com/tx/${whale.transaction?.hash}`,
        inline: false,
      },
      {
        name: '⠀',
        value: `[Problems or requests? Report here](https://github.com/DukeFerdinand/whale-watcher/issues)`,
        inline: false,
      },
    ],
    footer: {
      text: `Made with ${Emoji.HEART} by DukeFerdinand`
    }
  })
}