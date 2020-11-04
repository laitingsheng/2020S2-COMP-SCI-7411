import _ from "lodash";

export default class RemoteGame {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    render() {
        const { height, width } = this.canvas,
            cx = Math.floor(width / 2),
            cy = Math.floor(height / 2);
        const {
            [this.current]: me,
            ...rest
        } = this.players;
        if (!me)
            throw new Error("Can't find an object as the current player");

        const { ctx, size } = this;
        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = 1;
        const lx = cx - 10, uy = cy - 10;
        if (me.it) {
            ctx.fillStyle = "darkred";
            ctx.fillRect(lx, uy, 21, 21);
            if (me.invisible) {
                ctx.strokeStyle = "gold";
                ctx.strokeRect(lx, uy, 21, 21);
            }
        } else {
            ctx.fillStyle = "navy";
            ctx.fillRect(lx, uy, 21, 21);
            ctx.strokeStyle = me.stunned
                ? "black"
                : me.boost
                    ? me.invincible ? "gold" : "purple"
                    : me.invincible ? "lime" : "silver";
            ctx.strokeRect(lx, uy, 21, 21);
        }

        const [mx, my] = me.position,
            dx = cx - mx,
            dy = cy - my,
            rdx = (width - cx) - (size - mx),
            rdy = (height - cy) - (size - my);
        ctx.fillStyle = "black";
        if (dx > 0)
            ctx.fillRect(0, 0, dx, height);
        if (dy > 0)
            ctx.fillRect(0, 0, width, dy);
        if (rdx > 0)
            ctx.fillRect(width - 1 - rdx, 0, rdx, height);
        if (rdy > 0)
            ctx.fillRect(0, height - 1 - rdy, width, rdy);
        _.forEach(rest, player => {
            const [px, py] = player.position, pcx = px + dx, pcy = py + dy;
            if (_.inRange(pcx, -9, width + 9) && _.inRange(pcy, -9, height + 9)) {
                const plx = pcx - 10, puy = pcy - 10;
                if (player.it) {
                    if (!player.invisible) {
                        ctx.fillStyle = "red";
                        ctx.fillRect(plx, puy, 20, 20);
                    }
                } else {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(plx, puy, 20, 20);
                    ctx.strokeStyle = me.stunned
                        ? "black"
                        : me.boost
                            ? me.invincible ? "gold" : "purple"
                            : me.invincible ? "lime" : "silver";
                    ctx.strokeRect(plx, puy, 20, 20);
                }
            }
        });
    }

    /**
     * @param {number} size
     * @param {RemotePlayer[]} players
     * @param {string} current
     */
    init(size, players, current) {
        this.size = size;
        /**
         * @type {Dictionary<RemotePlayer>}
         */
        this.players = _.mapKeys(players, v => v.id);
        this.current = current;
    }

    /**
     * @param {RemotePlayer} player
     */
    add = (player) => {
        this.players[player.id] = player;

        this.render();
    }

    /**
     * @param {RemotePlayer} player
     */
    remove = (player) => {
        delete this.players[player.id];

        this.render();
    }

    /**
     * @param {RemotePlayer[]} updates
     */
    update = (updates) => {
        const { players } = this;
        for (const player of updates)
            players[player.id] = player;

        this.render();
    }

    reset() {
        const { height, width } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        delete this.size;
        delete this.players;
        delete this.current;
    }
}
