import { connectToDatabase } from "./services/database.service";
import { runKaruraTask } from "./tasks/karura";
import { runMangataTask } from "./tasks/mangata";
import { runSiriusTask } from "./tasks/sirius";
import { runArswTask } from "./tasks/arsw";
import { runTuringTask } from "./tasks/turing";
import { runKintsugiTask } from "./tasks/kintsugi";
import { runInterlayTask } from "./tasks/interlay";

import { runNftTask } from "./tasks/nft";

const main = async () => {
    await runTuringTask();
    await runNftTask();
    await runMangataTask();
    // await runSiriusTask();
    await runInterlayTask();
    await runKintsugiTask();
    await runKaruraTask();
    await runArswTask();
    setInterval(runTuringTask, 1000 * 60 * 15)
    setInterval(runNftTask, 1000 * 60 * 60) // every hour
    setInterval(runMangataTask, 1000 * 60 * 15) // every 5min
    // setInterval(runSiriusTask, 1000 * 60 * 15) // every 5min
    setInterval(runInterlayTask, 1000 * 60 * 15) // every 5min
    setInterval(runKintsugiTask, 1000 * 60 * 15) // every 5min
    setInterval(runKaruraTask, 1000 * 60 * 15) // every 5min
    setInterval(runArswTask, 1000 * 60 * 15) // every 5min
}

connectToDatabase().then(() => {
    main();
}).catch((error: Error) => {
    console.error("Database connection failed", error)
    process.exit()
})
