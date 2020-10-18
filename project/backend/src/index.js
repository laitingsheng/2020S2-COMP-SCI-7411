import _ from "lodash";
import rxjs from "rxjs";
import io from "socket.io";

import { PORT, SIZE } from "./config.js"

class Player {
    /**
     * @param {[number, number]} position
     */
    constructor(position) {
        this.position = position;
        this.velocity = 1;
    }
}

class Game {
    /**
     * @param {number} size
     */
    constructor(size) {
        this.size = size;

        /**
         * @type {Player[][]}
         */
        this.grid = new Array(size);
        for (let i = 0; i < size; ++i)
            this.grid[i] = new Array(size);
    }
}

class GameServer {
    /**
     * @param {number} port
     * @param {number} size
     */
    constructor(port, size) {
        this.server = io({ serveClient: false, cookie: false });

        this.game = new Game(size);

        /**
         * @type {Object<string, Player>}
         */
        this.players = {};

        this.server.on("connect", socket => this.newPlayer(socket));

        this.server.listen(port);
    }

    /**
     * @param {io.Socket} socket
     */
    newPlayer(socket) {
        const size = this.game.size;
        /**
         * @type {[number, number]}
         */
        let position = [_.random(size), _.random(size)];
        while (this.game.grid[position[0]][position[1]])
            position = [_.random(size), _.random(size)]
        const player = new Player(position);

        this.players[socket.id] = player;
        socket.emit("player", player);
        socket.on("disconnect", () => {
            const [x, y] = this.players[socket.id].position;
            delete this.game.grid[x][y];
            delete this.players[socket.id];
        });
    }

    shutdown() {
        this.server.close();
    }
}

const server = new GameServer(PORT, SIZE);

const clean = () => server.shutdown();
process.on("SIGTERM", clean);
process.on("SIGINT", clean);
process.on("SIGQUIT", clean);
