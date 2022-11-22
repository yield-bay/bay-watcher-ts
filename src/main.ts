import { connectToDatabase } from "./services/database.service";
import { runKaruraTask } from "./tasks/karura";

const main = async () => {
    await runKaruraTask();
}

connectToDatabase().then(() => {
    main();
}).catch((error: Error) => {
    console.error("Database connection failed", error)
    process.exit()
})
