import {gql} from "graphql-request";

export const transactionQuery = gql`
    query TransactionQuery($limit: Int) {
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
                    is: "0xB450CBF17F6723Ef9c1bf3C3f0e0aBA368D09bF5"
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