import {EthereumDexTrades} from "../whaleService/types/generated";

export type ITransaction = EthereumDexTrades & {
  buyAmountInUsd: number;
  sellAmountInUsd: number;

}