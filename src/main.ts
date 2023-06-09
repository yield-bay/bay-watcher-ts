import { connectToDatabase } from "./services/database.service";
import { runKaruraTask } from "./tasks/karura";
import { runMangataTask } from "./tasks/mangata";
import { runSiriusTask } from "./tasks/sirius";
import { runArswTask } from "./tasks/arsw";
import { runTuringTask } from "./tasks/turing";
import { runKintsugiTask } from "./tasks/kintsugi";

import { runNftTask } from "./tasks/nft";

const main = async () => {
    await runTuringTask();
    await runNftTask();
    await runMangataTask();
    await runKintsugiTask();
    await runArswTask();
    await runKaruraTask();
    // await runSiriusTask();
    setInterval(runTuringTask, 1000 * 60 * 30)
    setInterval(runNftTask, 1000 * 60 * 60) // every hour
    setInterval(runMangataTask, 1000 * 60 * 5) // every 5min
    setInterval(runKintsugiTask, 1000 * 60 * 5) // every 5min
    setInterval(runArswTask, 1000 * 60 * 5) // every 5min
    setInterval(runKaruraTask, 1000 * 60 * 5) // every 5min
    // setInterval(runSiriusTask, 1000 * 60 * 5) // every 5min
}

connectToDatabase().then(() => {
    main();
}).catch((error: Error) => {
    console.error("Database connection failed", error)
    process.exit()
})
