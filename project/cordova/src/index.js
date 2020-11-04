import io from "socket.io-client";

import RemoteGame from "./RemoteGame";

import "./index.css";
import { fromEvent, Subscription } from "rxjs";
import { throttleTime } from "rxjs/operators";

const canvas = document.createElement("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
document.body.appendChild(canvas);

const socket = io("http://localhost", { autoConnect: false });
// const socket = io("http://10.0.2.2", { autoConnect: false });

const game = new RemoteGame(canvas);

window.onresize = () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    game.render();
}

/**
 * @type {Subscription}
 */
let sub = null;

socket
    .on("connect", () => {
        console.log(`connected to ${socket.id}`);

        socket
            .once("init", (size, players) => game.init(size, players, socket.id))
            .on("add", game.add)
            .on("remove", game.remove)
            .on("update", game.update);

        sub = fromEvent(canvas, "mousemove")
            .pipe(throttleTime(200))
            .subscribe(({ offsetX, offsetY }) => {
                const dx = offsetX - canvas.width / 2,
                    dy = offsetY - canvas.height / 2;
                if (dx && Math.abs(dx) >= Math.abs(dy))
                    socket.emit("move", Math.sign(dx), 0);
                else
                    socket.emit("move", 0, Math.sign(dy));
            });
    })
    .on("disconnect", reason => {
        console.log(`socket disconnected (${reason})`);

        sub.unsubscribe();
        sub = null;

        socket
            .off("init")
            .off("add")
            .off("remove")
            .off("update");

        game.reset();
    });

socket.connect();

window.onunload = () => socket.close();
