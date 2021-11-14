import mongoose, {CallbackError, Connection} from 'mongoose'

let connection: Connection;
export async function useMongoose(): Promise<Connection> {
  if (connection) {
    return connection
  }
  const connected = await new Promise<boolean | CallbackError>((resolve, reject) => {
    if (!process.env.MONGO_URL) {
      throw new Error("Cannot find MONGO_URL in env!")
    }
    mongoose.connect(process.env.MONGO_URL, (e) => {
      if (e) return reject(e)

      resolve(true)
    })
  })

  connection = mongoose.connection
  return connection
}