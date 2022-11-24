import { connectToDatabase } from "./services/database.service";
import { runKaruraTask } from "./tasks/karura";

const main = async () => {
    await runKaruraTask();
    setInterval(runKaruraTask, 1000 * 60 * 5) // every 5min
}

connectToDatabase().then(() => {
    main();
}).catch((error: Error) => {
    console.error("Database connection failed", error)
    process.exit()
})
