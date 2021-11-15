import {MessageEmbed, MessageEmbedOptions} from "discord.js";
import {Emoji} from "../../constants/emoji";
import {ITransaction} from "../../types/transaction";

export const createWhaleEmbed = (whale: ITransaction) => {
  let {COIN_SYMBOL} = process.env;
  if (!COIN_SYMBOL) {
    COIN_SYMBOL = whale.currency?.symbol || ''
  }

  const embed: MessageEmbedOptions = {
    title: `${Emoji.WHALE} Large transfer detected`,
    fields: [
      {
        name: 'Amount (USD)',
        value: `$${'ADD COIN GECKO HERE' || 'N/A'}`,
        inline: true,
      },
      {
        name: `Amount (${whale.currency?.symbol})`,
        value: `${whale.tokenTransferAmount.toLocaleString() || 'N/A'} ${whale.currency?.symbol}`,
        inline: true,
      },
      {
        name: `Amount (BNB)`,
        value: `${'ADD COIN GECKO HERE' || 'N/A'} BNB`,
        inline: false,
      },
      {
        name: `Sender Address`,
        value: `[${whale.sender?.address}${whale.sender?.smartContract?.contractType === 'DEX' && ' - DEX'}](https://bscscan.com/address/${whale.sender?.address})`,
        inline: true,
      },
      {
        name: `Receiver Address`,
        value: `[${whale.receiver?.address}${whale.receiver?.smartContract?.contractType === 'DEX' && ' - DEX'}](https://bscscan.com/address/${whale.receiver?.address})`,
        inline: true,
      },
      {
        name: 'BSCScan Link',
        value: `https://bscscan.com/tx/${whale.transaction?.hash}`,
        inline: false,
      },
      {
        name: '⠀',
        value: `[Report Bug/Requests](https://github.com/DukeFerdinand/whale-watcher/issues)`,
        inline: true,
      },
      {
        name: '⠀',
        value: `[Donate to fund ${Emoji.ROBOT}](https://bscscan.com/address/0xBa8a95983B04040289310Db2f7Bbf99E455f0D83)`,
        inline: true,
      },
    ],
    footer: {
      text: `Made with ${Emoji.HEART} by DukeFerdinand`
    }
  }

  return new MessageEmbed(embed)
}