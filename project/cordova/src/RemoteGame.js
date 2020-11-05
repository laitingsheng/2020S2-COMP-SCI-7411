import _ from "lodash";
import { fromEvent, interval, ReplaySubject } from "rxjs";
import { repeatWhen, take, throttle, throttleTime } from "rxjs/operators";

export default class RemoteGame {
    /**
     * @type {Object<string, RemotePlayer>}
     */
    players = {};

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {SocketIOClient.Socket} socket
     */
    constructor(canvas, socket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.socket = socket;
    }

    render() {
        const { height, width } = this.canvas,
            cx = width / 2,
            cy = height / 2;
        const {
            [this.current]: me,
            ...rest
        } = this.players;
        if (!me)
            return;

        const { ctx, size } = this;
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 3;

        if (me.it) {
            ctx.fillStyle = "darkred";
            ctx.fillRect(cx - 7, cy - 7, 15, 15);
            ctx.strokeStyle = me.invisible ? "gold" : "darkred";
            ctx.strokeRect(cx - 9, cy - 9, 19, 19);
        } else {
            ctx.fillStyle = "navy";
            ctx.fillRect(cx - 7, cy - 7, 15, 15);
            ctx.strokeStyle = me.stunned
                ? "black"
                : me.boost
                    ? me.invincible ? "gold" : "purple"
                    : me.invincible ? "lime" : "silver";
            ctx.strokeRect(cx - 9, cy - 9, 19, 19);
        }

        const [mx, my] = me.position,
            dx = cx - mx,
            dy = cy - my,
            rdx = cx - (size - mx),
            rdy = cy - (size - my);
        _.forEach(rest, player => {
            const [px, py] = player.position, pcx = px + dx, pcy = py + dy;
            if (_.inRange(pcx, width) && _.inRange(pcy, height)) {
                if (player.it) {
                    if (!player.invisible) {
                        ctx.fillStyle = "red";
                        ctx.fillRect(pcx - 10, pcy - 10, 21, 21);
                    }
                } else {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(pcx - 7, pcy - 7, 15, 15);
                    ctx.strokeStyle = me.stunned
                        ? "black"
                        : me.boost
                            ? me.invincible ? "gold" : "purple"
                            : me.invincible ? "lime" : "silver";
                    ctx.strokeRect(pcx - 9, pcy - 9, 19, 19);
                }
            }
        });

        ctx.fillStyle = "black";
        if (dx > 0)
            ctx.fillRect(0, 0, dx, height);
        if (dy > 0)
            ctx.fillRect(0, 0, width, dy);
        if (rdx > 0)
            ctx.fillRect(width - 1 - rdx, 0, rdx, height);
        if (rdy > 0)
            ctx.fillRect(0, height - 1 - rdy, width, rdy);
    }

    /**
     * @param {number} size
     * @param {RemotePlayer[]} players
     */
    init = (size, players) => {
        this.size = size;
        Object.assign(this.players, _.mapKeys(players, v => v.id));
        const { socket } = this;
        this.current = socket.id;

        const subject = this.subject = new ReplaySubject(1), { canvas } = this;
        this.ss = subject
            .pipe(
                take(1),
                repeatWhen(() => interval(20))
            )
            .subscribe(({ offsetX, offsetY }) => {
                const dx = offsetX - canvas.width / 2,
                    dy = offsetY - canvas.height / 2;
                if (dx && Math.abs(dx) >= Math.abs(dy))
                    socket.emit("move", Math.sign(dx), 0);
                else
                    socket.emit("move", 0, Math.sign(dy));
            });
        this.es = fromEvent(canvas, "mousemove")
            .pipe(throttleTime(20))
            .subscribe(subject);

        this.render();
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
        Object.assign(this.players, _.mapKeys(updates, v => v.id));

        this.render();
    }

    reset() {
        this.es.unsubscribe();
        delete this.es;
        this.ss.unsubscribe();
        delete this.ss;
        delete this.subject;

        const { height, width } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        delete this.size;
        delete this.current;
        this.players = {};
    }
}
