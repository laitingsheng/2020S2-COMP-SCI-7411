import _ from "lodash";

import Player from "./Player";

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

        const half = Math.floor(size / 2);
        // the yellow capsule will only spawn in the left half
        this.yellow = {
            cd: 0,
            position: [
                _.random(10, half - 10),
                _.random(10, size - 10)
            ]
        };
        // the yellow capsule will only spawn in the right half
        this.black = {
            cd: 0,
            position: [
                _.random(half + 11, size - 10),
                _.random(10, size - 10)
            ]
        };
    }

    /**
     * @returns {Player[]}
     */
    refresh() {
        const { yellow, black, size } = this,
            half = Math.floor(size / 2);

        // respawn each capsule
        if (yellow.cd && !--yellow.cd)
            yellow.position = [
                _.random(10, half - 10),
                _.random(10, size - 10)
            ];
        if (black.cd && !--black.cd)
            black.position = [
                _.random(half + 11, size - 10),
                _.random(10, size - 10)
            ];

        // refresh player status
        return _.filter(this.players, player => {
            let refreshed = false;
            if (player.stunned) {
                --player.stunned;
                refreshed = true;
            }
            if (player.invisible) {
                --player.invisible;
                refreshed = true;
            }
            if (player.invincible) {
                --player.invincible;
                refreshed = true;
            }
            return refreshed;
        });
    }

    /**
     * @returns {[number, number]}
     */
    spawn() {
        const { size } = this;
        let x = _.random(size), y = _.random(size);
        // avoid collision when generate new positions
        while (_.some(this.players, ({ position: [px, py] }) =>
            Math.abs(x - px) < 21 && Math.abs(y - py) < 21)) {
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

        // the initial player will be automatically the "it"
        return players[id] = new Player(id, this.spawn(), _.isEmpty(players));
    }

    /**
     * @param {Player} player
     * @param {number} dx
     * @param {number} dy
     * @returns {Player[]}
     */
    update(player, dx, dy) {
        const { size, players, yellow, black } = this,
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

                if (!yellow.cd) {
                    const [yx, yy] = yellow.position;
                    if (Math.abs(nx - yx) < 16 && Math.abs(ny - yy) < 16) {
                        yellow.cd = 20;
                        yellow.position = null;
                        player.invisible = 15;
                    }
                }

                if (!black.cd) {
                    const [bx, by] = black.position;
                    if (Math.abs(nx - bx) < 16 && Math.abs(ny - by) < 16) {
                        black.cd = 30;
                        black.position = null;
                        _.forEach(players, player => player.stunned = 20);
                    }
                }
            } else {
                let valid = true, np = [nx, ny];
                for (const oid in players) {
                    const other = players[oid], [px, py] = other.position;
                    if (Math.abs(px - nx) < 21 && Math.abs(py - ny) < 21) {
                        if (other.it)
                            np = this.spawn();
                        else
                            valid = false;
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
     * @returns Player
     */
    remove(player) {
        const { players } = this;
        delete players[player.id];

        if (player.it) {
            const others = Object.values(players);
            const { length } = others;
            if (length) {
                const selected = others[_.random(length - 1)];
                selected.it = true;
                return selected;
            }
        }
    }
}
