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
     * @param {Player} updates
     */
    check(...updates) {
        const { yellow, black } = this;

        let uses = _.mapKeys(updates, v => v.id);

        if (!yellow.cd) {
            const [yx, yy] = yellow.position,
                used = _.find(updates, ({ position: [x, y] }) =>
                    Math.abs(yx - x) < 16 && Math.abs(yy - y) < 16);
            if (used) {
                if (used.it)
                    used.invisible = 15;
                else
                    used.invincible = 15;
                yellow.cd = 20;
                yellow.position = null;
            }
        }

        if (!black.cd) {
            const [bx, by] = black.position,
                used = _.find(updates, ({ position: [x, y] }) =>
                    Math.abs(bx - x) < 16 && Math.abs(by - y) < 16);
            if (used) {
                if (used.it) {
                    const { id } = used, { players } = this;
                    _.forEach(players, other => {
                        if (other.id !== id)
                            other.stunned = 10;
                    });
                    uses = players;
                }
                black.cd = 30;
                black.position = null;
            }
        }

        return _.values(uses);
    }

    /**
     * @param {Player} player
     * @param {number} dx
     * @param {number} dy
     * @returns {Player[]}
     */
    update(player, dx, dy) {
        if (player.stunned)
            return [];

        const { size, players } = this,
            { position, id } = player,
            [ox, oy] = position,
            nx = ox + dx,
            ny = oy + dy;
        // the centre must be in range
        if (_.inRange(nx, size + 1) && _.inRange(ny, size + 1)) {
            /**
             * @type {Player[]}
             * find out all collisions
             */
            const cs = _.filter(players, ({ id: oid, position: [px, py] }) =>
                oid !== id &&
                Math.abs(px - nx) < 21 && Math.abs(py - ny) < 21);
            // when player is "it"
            if (player.it) {
                // empty will return true
                if (_.every(cs, ({ invincible }) => !invincible)) {
                    player.position = [nx, ny];

                    const { length } = cs;
                    if (length) {
                        // the current "it" will be updated
                        player.it = false;
                        player.invisible = 0;
                        // reset and respawn all tagged people
                        _.forEach(cs, other => {
                            other.position = this.spawn();
                            other.stunned = other.invincible = 0;
                        });
                        // randomly select a new "it"
                        cs[_.random(length - 1)].it = true;
                    }
                    return this.check(player, ...cs);
                }
                // blocked movement due to invincible will have no updates
                return [];
            }
            // normal
            switch (cs.length) {
                case 0:
                    player.position = [nx, ny];
                    return this.check(player);
                case 1:
                    if (cs[0].it && !player.invincible){
                        player.position = this.spawn();
                        return this.check(player);
                    }
                default:
                    return [];
            }
        }
        return [];
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
                selected.stunned = selected.invincible = 0;
                return selected;
            }
        }
    }
}
