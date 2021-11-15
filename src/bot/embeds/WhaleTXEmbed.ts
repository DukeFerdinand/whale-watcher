import {MessageEmbed, MessageEmbedOptions} from "discord.js";
import {Emoji} from "../../constants/emoji";
import {ITransaction} from "../../types/transaction";
import {CoinResponse} from "../../coinGecko";

export const createWhaleEmbed = (whale: ITransaction, tokenPrices: CoinResponse) => {
  let {COIN_GECKO_ID} = process.env;

  if (!COIN_GECKO_ID) {
    throw new Error('Cannot find COIN_GECKO_ID in env')
  }

  const tokenInUSD = whale.tokenTransferAmount ? whale.tokenTransferAmount * tokenPrices[COIN_GECKO_ID]['usd'] : 'N/A'
  const tokenInBNB = whale.tokenTransferAmount ? whale.tokenTransferAmount * tokenPrices[COIN_GECKO_ID]['bnb'] : 'N/A'

  const embed: MessageEmbedOptions = {
    title: `${Emoji.WHALE} Large transfer detected`,
    fields: [
      {
        name: `Amount (${whale.currency?.symbol})`,
        value: `${whale.tokenTransferAmount.toLocaleString() || 'N/A'} ${whale.currency?.symbol}`,
        inline: false,
      },
      {
        name: 'Amount (USD)',
        value: `$${tokenInUSD.toLocaleString()}`,
        inline: true,
      },
      {
        name: `Amount (BNB)`,
        value: `${tokenInBNB.toLocaleString()} BNB`,
        inline: true,
      },
      {
        name: `Sender Address`,
        value: `[${whale.sender?.address}${whale.sender?.smartContract?.contractType === 'DEX' ? ' - DEX' : ''}](https://bscscan.com/address/${whale.sender?.address})`,
        inline: false,
      },
      {
        name: `Receiver Address`,
        value: `[${whale.receiver?.address}${whale.receiver?.smartContract?.contractType === 'DEX' ? ' - DEX' : ''}](https://bscscan.com/address/${whale.receiver?.address})`,
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
