import io from "socket.io-client";

import RemoteGame from "./RemoteGame";

import "./index.css";
import { fromEvent, interval, ReplaySubject, Subscription } from "rxjs";
import { repeatWhen, take, throttleTime } from "rxjs/operators";

const canvas = document.createElement("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
document.body.appendChild(canvas);

const socket = io("http://localhost", { autoConnect: false });
// const socket = io("http://10.0.2.2", { autoConnect: false });

const game = new RemoteGame(canvas, socket);

window.onresize = () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    game.render();
}

socket
    .on("connect", () => {
        console.log(`connected to ${socket.id}`);

        socket
            .once("init", game.init)
            .on("add", game.add)
            .on("remove", game.remove)
            .on("update", game.update);
    })
    .on("disconnect", reason => {
        console.log(`socket disconnected (${reason})`);

        socket
            .off("init")
            .off("add")
            .off("remove")
            .off("update");

        game.reset();
    });

socket.connect();

window.onunload = () => socket.close();
