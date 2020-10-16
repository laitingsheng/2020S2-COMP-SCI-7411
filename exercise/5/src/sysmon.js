import $ from "jquery";
import hljs from "highlight.js";

import { fromEvent } from "rxjs";
import { map, scan } from "rxjs/operators";
import io from "socket.io-client";

const socket = io("http://edcsystem.hopto.org/");

// const limit = 50;

// const data = Object.freeze({
//     load: [],
//     disk: [],
//     network: [],
//     procs: [],

//     update(k, v) {
//         const values = this[k];
//         k.push(v);
//         if (values.length > limit)
//             values.shift();
//     }
// });

var sub = null;

const body = $(document.body);

const main = body.find("#main");

console.log(main);

body.on("load", () => {
    sub = fromEvent(socket, "data")
        .pipe(
            scan((acc, value) => Object.assign(acc, value), {}),
            map(object => Object.entries(object).reduce((acc, [k, v]) => `${acc}<h1>${k}</h1><pre><code class="hljs json">${hljs.highlight("json", JSON.stringify(v, null, 2)).value}</code></pre>`, ""))
        ).subscribe(code => main.html(code));
});

body.on("unload", () => {
    sub.unsubscribe();
    socket.close();
});
