import { PORT, SIZE } from "./config.js";
import { GameServer } from "./game.js";

const server = new GameServer(PORT, SIZE);

const clean = () => server.shutdown();
process.on("SIGTERM", clean);
process.on("SIGINT", clean);
process.on("SIGQUIT", clean);
