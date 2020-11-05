import _ from "lodash";
import { fromEvent, interval, ReplaySubject } from "rxjs";
import { repeatWhen, take, throttleTime } from "rxjs/operators";

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
        // do nothing instead of throwing an exception
        const {
            [this.current]: me,
            ...rest
        } = this.players;
        if (!me)
            return;

        // clear the canvas first
        const { height, width } = this.canvas,
            { ctx, size, yellow, black } = this;
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 3;

        // compute the adjustment needed to lock to the centre
        const cx = width / 2,
            cy = height / 2,
            [mx, my] = me.position,
            dx = cx - mx,
            dy = cy - my,
            rdx = cx - (size - mx),
            rdy = cy - (size - my);

        // render capsules if not in cool down period
        if (!yellow.cd) {
            ctx.fillStyle = "yellow";
            const [yx, yy] = yellow.position;
            ctx.fillRect(yx + dx - 5, yy + dy - 5, 11, 11);
        }
        if (!black.cd) {
            ctx.fillStyle = "black";
            const [bx, by] = black.position;
            ctx.fillRect(bx + dx - 5, by + dy - 5, 11, 11);
        }

        // render other players first
        _.forEach(rest, player => {
            const [px, py] = player.position, pcx = px + dx, pcy = py + dy;
            // only render players in sight to avoid extra computations
            if (_.inRange(pcx, width) && _.inRange(pcy, height)) {
                if (player.it) {
                    // invisible effect
                    if (!player.invisible) {
                        ctx.fillStyle = "red";
                        ctx.fillRect(pcx - 7, pcy - 7, 15, 15);
                        // border here is just a decoration
                        ctx.strokeStyle = "green";
                        ctx.strokeRect(pcx - 9, pcy - 9, 19, 19);
                    }
                } else {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(pcx - 7, pcy - 7, 15, 15);
                    // the stroke (as the border) implies the effects
                    ctx.strokeStyle = player.stunned
                        ? "black"
                        : player.invincible ? "gold" : "green";
                    ctx.strokeRect(pcx - 9, pcy - 9, 19, 19);
                }
            }
        });

        // the colour will be deeper than others to emphasise current player
        if (me.it) {
            ctx.fillStyle = "darkred";
            ctx.fillRect(cx - 7, cy - 7, 15, 15);
            // border here will now imply the invisible effect
            ctx.strokeStyle = me.invisible ? "gold" : "green";
            ctx.strokeRect(cx - 9, cy - 9, 19, 19);
        } else {
            ctx.fillStyle = "navy";
            ctx.fillRect(cx - 7, cy - 7, 15, 15);
            // same as previous
            ctx.strokeStyle = me.stunned
                ? "black"
                : me.invincible ? "gold" : "green";
            ctx.strokeRect(cx - 9, cy - 9, 19, 19);
        }

        // these regions may not be displayed and just indicators of the bounds
        ctx.fillStyle = "black";
        if (dx > 0)
            ctx.fillRect(0, 0, dx, height);
        if (dy > 0)
            ctx.fillRect(0, 0, width, dy);
        if (rdx > 0)
            ctx.fillRect(width - 1 - rdx, 0, rdx + 1, height);
        if (rdy > 0)
            ctx.fillRect(0, height - 1 - rdy, width, rdy + 1);
    }

    /**
     * @param {RemoteWorld} world
     */
    init = (world) => {
        // initialised the world
        this.size = world.size;
        _.assign(this.players, _.mapKeys(world.players, v => v.id));
        this.yellow = world.yellow;
        this.black = world.black;

        // the ID will be synced with the server
        const { socket } = this;
        this.current = socket.id;

        // create a subject to repeatedly emit last event if no more arrived
        const subject = this.subject = new ReplaySubject(1),
            { canvas } = this;
        this.ss = subject
            .pipe(
                take(1),
                repeatWhen(() => interval(20))
            )
            .subscribe(({ offsetX, offsetY }) => {
                // compute the directions (left/right/up/down)
                const dx = offsetX - canvas.width / 2,
                    dy = offsetY - canvas.height / 2;
                if (dx && Math.abs(dx) >= Math.abs(dy))
                    socket.emit("move", Math.sign(dx), 0);
                else
                    socket.emit("move", 0, Math.sign(dy));
            });
        // responds to "mousemove" event and pipe it to above
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
     * @param {CapsuleProperty} yellow
     * @param {CapsuleProperty} black
     */
    capsules = (yellow, black) => {
        this.yellow = yellow;
        this.black = black;
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
        _.assign(this.players, _.mapKeys(updates, v => v.id));

        this.render();
    }

    reset() {
        // deregister all listeners
        this.es.unsubscribe();
        delete this.es;
        this.ss.unsubscribe();
        delete this.ss;
        delete this.subject;

        // clear the canvas and the game
        const { height, width } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        delete this.size;
        delete this.yellow;
        delete this.black;
        delete this.current;
        this.players = {};
    }
}
