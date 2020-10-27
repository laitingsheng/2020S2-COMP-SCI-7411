import _ from "lodash";
import rxjs from "rxjs";
import io from "socket.io";

/**
 * @type {Readonly<Object<string, [number, number]>>}
 */
export const DIRECTIONS = {
    left: [-1, 0],
    right: [1, 0],
    up: [0, -1],
    down: [0, 1]
};

export class Player {
    /**
     * @param {[number, number]} position
     */
    constructor(position) {
        this.position = position;
        this.it = false;
        this.boost = 0;
        this.invincible = 0;
        this.stunned = 0;
    }
}

export class Game {
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
            this.grid[i] = new Array(size).fill(null);
    }

    /**
     * @param {Player} player
     * @param {string} direction
     */
    move(player, direction) {
        if (player.stunned > 0)
            return false;
        const [ox, oy] = player.position, [dx, dy] = DIRECTIONS[direction], md = (1 + +(player.boost > 0)) * (1 + +player.it);
        for (let x = ox, y = oy, i = 0; i < md && _.inRange(x, this.size) && _.inRange(y, this.size); ++i) {}
        return true;
    }

    /**
     * @returns {[number, number]}
     */
    _newPos() {
        let x = _.random(this.size), y = _.random(this.size);
        while (this.grid[x][y] !== null) {
            x = _.random(this.size);
            y = _.random(this.size);
        }
        return [x, y];
    }

    newPlayer() {
        const position = this._newPos(), player = new Player(position);
        this.grid[position[0]][position[1]] = player;
        return player;
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    remove(x, y) {
        delete this.grid[x][y];
    }
}

export class GameServer {
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
     * @param {SocketIO.Socket} socket
     */
    newPlayer(socket) {
        const player = this.players[socket.id] = this.game.newPlayer();
        socket.on("disconnect", () => {
            const position = this.players[socket.id].position;
            this.game.remove(position[0], position[1]);
            delete this.players[socket.id];
        })
        socket.emit("status", player);
    }

    shutdown() {
        this.server.close();
    }
}
