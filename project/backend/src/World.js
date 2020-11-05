import _ from "lodash";

import Player from "./Player";

const SPEED = 5;

export default class World {
    /**
     * @type {Object<string, Player>}
     */
    players = {};

    /**
     * @param {number} size
     */
    constructor(size) {
        this.size = size;
    }

    /**
     * @returns {[number, number]}
     */
    spawn() {
        const { size, players } = this;
        let x = _.random(size), y = _.random(size);
        while (_.some(players, ({ position: [px, py] }) => Math.abs(x - px) < 21 && Math.abs(y - py) < 21)) {
            x = _.random(size);
            y = _.random(size);
        }
        return [x, y];
    }

    /**
     * @param {string} id
     * @returns {Player}
     */
    add(id) {
        const { players } = this;

        return players[id] = new Player(id, this.spawn(), _.isEmpty(players));
    }

    /**
     * @param {Player} player
     * @param {number} dx
     * @param {number} dy
     * @returns {Player[]}
     */
    update(player, dx, dy) {
        const { size, players } = this,
            { position, id } = player,
            [ox, oy] = position,
            nx = ox + dx,
            ny = oy + dy;
        const updated = [];
        if (_.inRange(nx, size + 1) && _.inRange(ny, size + 1)) {
            delete players[id];
            if (player.it) {
                player.position = [nx, ny];
                updated.push(player);
                for (const oid in players) {
                    const other = players[oid], [px, py] = other.position;
                    if (Math.abs(px - nx) < 21 && Math.abs(py - ny) < 21) {
                        player.it = false;
                        other.it = true;
                        other.position = this.spawn();
                        updated.push(other);
                        break;
                    }
                }
            } else {
                let valid = true, np = [nx, ny];
                for (const oid in players) {
                    const other = players[oid], [px, py] = other.position;
                    if (Math.abs(px - nx) < 21 && Math.abs(py - ny) < 21) {
                        if (other.it) np = this.spawn(); else valid = false;
                        break;
                    }
                }
                if (valid) {
                    player.position = np;
                    updated.push(player);
                }
            }
            players[id] = player;
        }
        return updated;
    }

    /**
     * @param {Player} player
     */
    remove(player) {
        delete this.players[player.id];
    }
}
