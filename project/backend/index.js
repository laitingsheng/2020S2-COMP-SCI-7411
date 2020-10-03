import express from "express";
import { v4 as uuidv4 } from "uuid";

const _rand_int = (start, end) => Math.floor(Math.random() * (end - start + 1)) + start;

const app = express();
const in_game = {}

app.use(express.json());

app.post("/join", (req, res) => {
    var uid = uuidv4();
    while (uid in in_game)
        uid = uuidv4();
    in_game[uid] = {
        it: false,
        pos: [_rand_int(0, 1000), _rand_int(0, 1000)]
    }
    res.send(uid)
});

app.listen(80)
