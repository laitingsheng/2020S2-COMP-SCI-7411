import _ from "lodash";

import { fromEvent } from "rxjs";
import io from "socket.io-client";

import { LoadHandler, DiskHandler, NetworkHandler, ProcessesHandler } from "./handler";
import { e } from "./render";

import "bootstrap";

const socket = io("http://edcsystem.hopto.org/");
const stream = fromEvent(socket, "data");

const tabs = {
    load: new LoadHandler("load", "Load", stream),
    disk: new DiskHandler("disk", "Disk", stream),
    network: new NetworkHandler("network", "Network", stream),
    procs: new ProcessesHandler("procs", "Processes", stream)
};

window.onunload = () => {
    _.forIn(tabs, ({ subscription }) => subscription.unsubscribe());
    socket.close();
};

document.body.appendChild(e("div", { class: "m-4 row" },
    e("div", { class: "nav flex-column nav-pills col-2", role: "tablist", "aria-orientation": "vertical" },
        ..._.map(tabs, ({ nav }) => nav)
    ),
    e("div", { class: "tab-content col-10" },
        ..._.map(tabs, ({ content }) => content)
    )
));
