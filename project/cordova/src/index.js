import io from "socket.io-client";

import RemoteGame from "./RemoteGame";

import "./index.css";

// create and append the canvas for rendering
const canvas = document.createElement("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
document.body.appendChild(canvas);

// initiate the socket without auto connection
// const socket = io("http://localhost", { autoConnect: false });
// const socket = io("http://10.0.2.2", { autoConnect: false });
const socket = io("http://edcsystem.hopto.org", { autoConnect: false });

// allocate a game which is not initialised with an actual game yet
const game = new RemoteGame(canvas, socket);

// mostly a browser-only feature
window.onresize = () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    game.render();
}

socket
    .on("connect", () =>
        socket
            // "init" will only be sent once which is the actual initialisation
            .once("init", game.init)
            .on("capsules", game.capsules)
            .on("add", game.add)
            .on("remove", game.remove)
            .on("update", game.update)
    )
    .on("disconnect", () => {
        // turn off all listeners
        socket
            .off("init")
            .off("capsules")
            .off("add")
            .off("remove")
            .off("update");

        // reset the game to prepare for a new game
        game.reset();
    });

// start the connection
socket.connect();

// graceful shutdown
window.onunload = () => socket.close();
