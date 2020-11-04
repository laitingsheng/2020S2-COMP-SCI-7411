import _ from "lodash";

import Player from "./Player";

const SPEED = 5;

export default class World {
    /**
     * @type {Object<string, Player>}
     */
    players = {};

    /**
     * @type {Object<[number, number], Player>}
     */
    grid = {};

    /**
     * @param {number} size
     */
    constructor(size) {
        this.size = size;
    }

    /**
     * @param {string} id
     * @returns {Player}
     */
    add(id) {
        const { size, grid, players } = this;
        let p = [_.random(size), _.random(size)];
        while (grid[p])
            p = [_.random(size), _.random(size)];

        return grid[p] = players[id] = new Player(id, p, _.isEmpty(players));
    }

    /**
     * @param {Player} player
     * @param {number} dx
     * @param {number} dy
     * @returns {Player[]}
     */
    update(player, dx, dy) {
        const { size, players } = this;
        delete players[player.id];
        const speed = SPEED * (1 + +player.it);
        for (
            let i = 0, [nx, ny] = player.position;
            i < speed && _.inRange(nx + dx, 10, size) && _.inRange(ny + dy, size);
            ++i
        ) {
            nx += dx;
            ny += dy;
        }
        return [];
    }

    /**
     * @param {Player} player
     */
    remove(player) {
        delete this.grid[player.position];
        delete this.players[player.id];
    }
}
