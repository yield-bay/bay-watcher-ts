// External Dependencies
import * as mongoDB from "mongodb"
import * as dotenv from "dotenv"

// Global Variables
export const collections: {
  assets?: mongoDB.Collection
  farms?: mongoDB.Collection
  users?: mongoDB.Collection
  xcmpTasks?: mongoDB.Collection
  liquidityEvents?: mongoDB.Collection
  autocompoundEvents?: mongoDB.Collection
} = {}

// Initialize Connection
export async function connectToDatabase() {
  dotenv.config()

  const dbConnUrl: string = process.env.DB_CONN_STRING!

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(dbConnUrl)

  await client.connect()

  const db: mongoDB.Db = client.db(process.env.DB_NAME)
  const leaderboardDb: mongoDB.Db = client.db(process.env.LEADERBOARD_DB_NAME)

  const assetsCollection: mongoDB.Collection = db.collection("assets")
  const farmsCollection: mongoDB.Collection = db.collection("farms")
  const usersCollection: mongoDB.Collection = leaderboardDb.collection("User")
  const xcmpTasksCollection: mongoDB.Collection = db.collection("xcmpTasks")
  const liquidityEventsCollection: mongoDB.Collection = db.collection("liquidityEvents")
  const autocompoundEventsCollection: mongoDB.Collection = db.collection("autocompoundEvents")

  collections.assets = assetsCollection
  collections.farms = farmsCollection
  collections.users = usersCollection
  collections.xcmpTasks = xcmpTasksCollection
  collections.liquidityEvents = liquidityEventsCollection
  collections.autocompoundEvents = autocompoundEventsCollection

  console.log(`Successfully connected to database: ${db.databaseName}`)
}
