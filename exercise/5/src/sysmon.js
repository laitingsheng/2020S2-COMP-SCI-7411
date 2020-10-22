import _ from "lodash";

import { fromEvent } from "rxjs";
import io from "socket.io-client";

import "bootstrap";

import { LoadHandler, DiskHandler, NetworkHandler, ProcessesHandler } from "./handler";

const socket = io("http://edcsystem.hopto.org/");
const stream = fromEvent(socket, "data");

const tabs = {
    load: new LoadHandler("load", "Load", stream),
    disk: new DiskHandler("disk", "Disk", stream),
    network: new NetworkHandler("network", "Network", stream),
    procs: new ProcessesHandler("procs", "Processes", stream)
};

const body = document.body;

window.onunload = () => {
    _.forIn(tabs, ({ subscription }) => subscription.unsubscribe());
    socket.close();
};

const container = document.createElement("div");
container.classList.add("m-2", "row");

body.appendChild(container);

const main_nav = document.createElement("div");
main_nav.classList.add("nav", "flex-column", "nav-pills", "col-2");
main_nav.setAttribute("role", "tablist");
main_nav.setAttribute("aria-orientation", "vertical");

const main_content = document.createElement("div");
main_content.classList.add("tab-content", "col-10");

_.forIn(tabs, ({ nav, content }) => {
    main_nav.appendChild(nav);
    main_content.appendChild(content);
});

const { nav: selected_nav, content: selected_content } = tabs.load;
selected_nav.classList.add("active");
selected_nav.setAttribute("aria-selected", "true");

selected_content.classList.add("show", "active");

container.appendChild(main_nav);
container.appendChild(main_content);
