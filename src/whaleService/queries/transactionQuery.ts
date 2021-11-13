import {gql} from "graphql-request";

export const transactionQuery = gql`
    query TransactionQuery($limit: Int, $contract: String) {
        ethereum(network: bsc) {
            dexTrades(
                options: {
                    limit: $limit,
                    desc: "block.height"
                },
                exchangeName: {
                    in: ["Pancake", "Pancake v2"]
                },
                smartContractAddress:{
                    is: $contract
                }
            ) {
                transaction {
                    hash
                }
                smartContract {
                    address {
                        address
                    }
                    contractType
                    currency {
                        name
                    }
                }
                tradeIndex
                date {
                    date
                }
                block {
                    height
                }
                buyAmount
                buyAmountInUsd: buyAmount(in: USD)
                buyCurrency {
                    symbol
                    address
                }
                sellAmount
                sellAmountInUsd: sellAmount(in: USD)
                sellCurrency {
                    symbol
                    address
                }
                sellAmountInUsd: sellAmount(in: USD)
                tradeAmount(in: USD)
            }
        }
    }
`