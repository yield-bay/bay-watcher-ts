import { connectToDatabase } from "./services/database.service";
import { runKaruraTask } from "./tasks/karura";
import { runMangataTask } from "./tasks/mangata";
import { runSiriusTask } from "./tasks/sirius";

const main = async () => {
    await runSiriusTask();
    await runMangataTask();
    await runKaruraTask();
    setInterval(runSiriusTask, 1000 * 60 * 5) // every 5min
    setInterval(runMangataTask, 1000 * 60 * 5) // every 5min
    setInterval(runKaruraTask, 1000 * 60 * 5) // every 5min
}

connectToDatabase().then(() => {
    main();
}).catch((error: Error) => {
    console.error("Database connection failed", error)
    process.exit()
})
