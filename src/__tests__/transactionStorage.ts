import dotenv from "dotenv";
import {TransactionStorage} from "../database/transactionStorage";

const __test = async () => {
  dotenv.config()
  console.log('[Test] Testing Transaction Storage')

  console.log('[Test] Getting connection')
  const connection = await TransactionStorage.getConnection()
  console.log('[Test] Using connection')
  const service = new TransactionStorage('test-namespace', connection)


  await service.storeNewTransactions([
      '0x83c5adaca955fea22a3f8077d3d4966167ec25776bef0bd7671725d93407e970',
      '0xdc56674867a6fc7e766fa90c4ff1911f207de58acbc91b80a60c9f413680ee7e',
  ])

  console.log('[Test] Done, dropping connection')
  await connection.close()
}

__test().catch((e) => {
  console.error(e)
})