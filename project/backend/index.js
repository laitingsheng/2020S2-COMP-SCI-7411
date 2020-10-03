import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
const in_game = {}

app.use(express.json());

app.post("/join", (req, res) => {
    var uid = uuidv4();
    while (uid in in_game)
        uid = uuidv4();
    in_game[uid] = {
        it: false,
        dir: [0, 0],
        pos: [100 + Math.random() * 800, 100 + Math.random() * 800]
    }
    res.status(201).send(uid)
});

app.get("/info/:uid", (req, res) => res.send(in_game[req.params.uid]));

app.post("/direction/:uid", (req, res) => {
    const uid = req.params.uid;
    if (uid in in_game) {
        const { x, y } = req.body;
        in_game[uid].dir = [x, y];
    } else
        res.status(400).send(`${uid} is not valid`);
});

app.listen(80)
