import {gql} from "graphql-request";

export const transactionQuery = gql`
    query TransactionsQuery($limit: Int, $contract: String, $whaleAmount: Float) {
        ethereum(network: bsc) {
            transfers(
                options: {desc: ["block.height"],
                    limit: $limit},
                currency: {is: $contract},
                amount: {gteq: $whaleAmount }
            ) {
                block {
                    height
                }
                sender {
                    address
                    smartContract {
                        contractType
                    }
                }
                currency {
                    name
                    symbol
                }
                tokenTransferAmount: amount
                transaction{
                    hash
                }
                receiver {
                    annotation
                    smartContract {
                        contractType
                    }
                    address
                }
            }
        }
    }
`