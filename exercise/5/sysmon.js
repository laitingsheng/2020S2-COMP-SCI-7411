// @ts-check

const { from, fromEvent, operators } = rxjs;
const { mergeMap } = operators;

const socket = io("http://edcsystem.hopto.org/");

/** @global @type {Object<string, handler>} */
const data = {
    "load": {},
    "network": {},
    "disk": {},
    "procs": {}
};

const sub = fromEvent(socket, "data")
    .pipe(mergeMap(obj => from(Object.keys(obj).map(k => data[k].update(obj[k])))))
    .subscribe(h => h.invoke())

function loaded() {}

function unloaded() {
    sub.unsubscribe();
    socket.close();
}
