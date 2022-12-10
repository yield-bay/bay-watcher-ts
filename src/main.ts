import { connectToDatabase } from "./services/database.service";
import { runKaruraTask } from "./tasks/karura";
import { runMangataTask } from "./tasks/mangata";
import { runSiriusTask } from "./tasks/sirius";
import { runArswTask } from "./tasks/arsw";

const job = async () => {
    await runArswTask();
    await runSiriusTask();
    await runMangataTask();
    await runKaruraTask();
}
const main = async () => {
    await job();
    // await runArswTask();
    // await runSiriusTask();
    // await runMangataTask();
    // await runKaruraTask();
    // setInterval(runArswTask, 1000 * 60 * 5) // every 5min
    // setInterval(runSiriusTask, 1000 * 60 * 5) // every 5min
    // setInterval(runMangataTask, 1000 * 60 * 5) // every 5min
    // setInterval(runKaruraTask, 1000 * 60 * 5) // every 5min
    setInterval(job, 1000 * 60 * 5);
}

connectToDatabase().then(() => {
    main();
}).catch((error: Error) => {
    console.error("Database connection failed", error)
    process.exit()
})
