import {MessageEmbed} from "discord.js";
import {Emoji} from "../../constants/emoji";
import {ITransaction} from "../../types/transaction";

export const createWhaleEmbed = (whale: ITransaction) => new MessageEmbed({
  title: `${Emoji.WHALE} Whale alert`,
  description: `From: `,
  fields: [
    {
      name: `Amount (${whale.buyCurrency?.symbol})`,
      value: `${whale.buyAmount?.toLocaleString() || 'N/A'}`,
      inline: false,
    },
    {
      name: 'Amount (USD)',
      value: `$${whale.tradeAmount?.toLocaleString() || 'N/A'}`,
      inline: true,
    },
    {
      name: `Amount (${whale.sellCurrency?.symbol})`,
      value: `${whale.sellAmount?.toLocaleString() || 'N/A'} BNB`,
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