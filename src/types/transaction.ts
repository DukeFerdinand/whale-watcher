import {EthereumDexTrades, EthereumTransfers} from "../whaleService/types/generated";

export type ITransaction = EthereumTransfers & {
  tokenTransferAmount: number
}