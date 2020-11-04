import io from "socket.io";

import World from "./World";

const server = io({ serveClient: false, cookie: false });

const PORT = 80;
const SIZE = 500;

const world = new World(SIZE);

server.on("connect", socket => {
    console.log(`${socket.id} connected`);

    socket.emit("init", SIZE, Object.values(world.players));

    const player = world.add(socket.id);

    /**
     * @param {number} dx
     * @param {number} dy
     */
    const onMove = (dx, dy) => server.emit("update", world.update(player, dx, dy));

    socket
        .once("disconnect", reason => {
            console.log(`${socket.id} disconnected (${reason})`);

            socket.off("move", onMove)
            world.remove(player);
            server.emit("remove", player);
        })
        .on("move", onMove);

    server.emit("add", player);
});

server.listen(PORT);

const clean = () => server.close();
process.on("SIGTERM", clean);
process.on("SIGINT", clean);
process.on("SIGQUIT", clean);
