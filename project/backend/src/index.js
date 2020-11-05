import io from "socket.io";

import World from "./World";

const server = io({ serveClient: false, cookie: false });

const PORT = 80;
const SIZE = 500;

const world = new World(SIZE);

setInterval(() => {
    server.emit("update", world.refresh());
    const { yellow, black } = world;
    server.emit("capsules", yellow, black);
}, 1000);

server.on("connect", socket => {
    console.log(`${socket.id} connected`);

    const player = world.add(socket.id);

    socket.emit("init", world);
    server.emit("add", player);

    /**
     * @param {number} dx
     * @param {number} dy
     */
    const onMove = (dx, dy) => {
        server.emit("update", world.update(player, dx, dy));
        const { yellow, black } = world;
        server.emit("capsules", yellow, black);
    };

    socket
        .on("move", onMove)
        .once("disconnect", reason => {
            console.log(`${socket.id} disconnected (${reason})`);

            socket.off("move", onMove)
            const elected = world.remove(player);
            if (elected)
                socket.emit("update", [elected]);
            server.emit("remove", player);
        });
});

server.listen(PORT);

const clean = () => server.close();
process.on("SIGTERM", clean);
process.on("SIGINT", clean);
process.on("SIGQUIT", clean);
