"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_service_1 = require("./services/database.service");
const karura_1 = require("./tasks/karura");
const main = async () => {
    await (0, karura_1.runKaruraTask)();
};
(0, database_service_1.connectToDatabase)().then(() => {
    main();
}).catch((error) => {
    console.error("Database connection failed", error);
    process.exit();
});
