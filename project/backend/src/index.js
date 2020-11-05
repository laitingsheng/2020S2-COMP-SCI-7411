import io from "socket.io";

import World from "./World";

const server = io({ serveClient: false, cookie: false });

const PORT = 80;
const SIZE = 500;

const world = new World(SIZE);

server.on("connect", socket => {
    console.log(`${socket.id} connected`);

    const player = world.add(socket.id);

    server.emit("add", player);
    socket.emit("init", SIZE, Object.values(world.players));

    /**
     * @param {number} dx
     * @param {number} dy
     */
    const onMove = (dx, dy) => server.emit("update", world.update(player, dx, dy));

    socket
        .on("move", onMove)
        .once("disconnect", reason => {
            console.log(`${socket.id} disconnected (${reason})`);

            socket.off("move", onMove)
            world.remove(player);
            server.emit("remove", player);
        });
});

server.listen(PORT);

const clean = () => server.close();
process.on("SIGTERM", clean);
process.on("SIGINT", clean);
process.on("SIGQUIT", clean);
