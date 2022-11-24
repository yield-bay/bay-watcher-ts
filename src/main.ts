import { connectToDatabase } from "./services/database.service";
import { runKaruraTask } from "./tasks/karura";
import { runMangataTask } from "./tasks/mangata";

const main = async () => {
    await runMangataTask();
    await runKaruraTask();
    setInterval(runMangataTask, 1000 * 60 * 5) // every 5min
    setInterval(runKaruraTask, 1000 * 60 * 5) // every 5min
}

connectToDatabase().then(() => {
    main();
}).catch((error: Error) => {
    console.error("Database connection failed", error)
    process.exit()
})
