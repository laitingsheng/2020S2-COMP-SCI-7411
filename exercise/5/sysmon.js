const { fromEvent, operators } = rxjs;
const { filter, pluck, tap } = operators;

var socket = null;
const subs = {};

function create_card(title) {
    const card = document.createElement("div");
    card.classList.add("card");
    const card_title = document.createElement("h5");
    card_title.innerText = title;
    card_title.classList.add("card-header");
    card.appendChild(card_title);
    const options_body = document.createElement("div");
    options_body.classList.add("card-header");
    card.appendChild(options_body);
    const card_body = document.createElement("pre");
    card_body.classList.add("card-body");
    card.appendChild(card_body);
    const card_body_data = document.createElement("code");
    card_body_data.classList.add("hljs", "json");
    card_body.appendChild(card_body_data);

    return [card, options_body, card_body_data]
}

function create_checkbox(title, id, status, handler) {
    const checkbox_group = document.createElement("div");
    checkbox_group.classList.add("form-check");
    const checkbox = document.createElement("input");
    checkbox.classList.add("form-check-input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = status;
    checkbox.onchange = handler;
    checkbox_group.appendChild(checkbox);
    const checkbox_label = document.createElement("label");
    checkbox_label.classList.add("form-check-label");
    checkbox_label.htmlFor = id;
    checkbox_label.innerText = title;
    checkbox_group.appendChild(checkbox_label);
    return checkbox_group;
}

function replacer(_k, v) {
    return v === null || v.toFixed === undefined ? v : Number(v.toFixed(2));
}

function render(element, obj) {
    element.innerHTML = hljs.highlight("json", JSON.stringify(obj, replacer, 2)).value;
}

const handlers = {
    load: {
        data: null,

        average: true,
        raw: false,
        type: {
            load: true,
            load_user: true,
            load_system: true,
            load_nice: false,
            load_idle: true,
            load_irq: false
        },
        cpus: true,

        init(area) {
            const [card, options_body, card_body_data] = create_card("Load");
            this.card_body_data = card_body_data;

            const self = this;

            options_body.appendChild(create_checkbox("Average", "avgload", this.average, function() {
                self.average = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            options_body.appendChild(create_checkbox("Raw", "load-raw", this.raw, function() {
                self.raw = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            const desc = {
                load: "Load %",
                load_user: "Load (User) %",
                load_system: "Load (System) %",
                load_nice: "Load (Nice Value)",
                load_idle: "Load (Idle) %",
                load_irq: "Load (IRQ) %"
            };
            for (const k in desc)
                options_body.appendChild(create_checkbox(desc[k], k, this.type[k], function() {
                    self.type[k] = this.checked;
                    if (self.data !== null)
                        self.render();
                }));

            options_body.appendChild(create_checkbox("CPUs", "cpu", this.cpus, function() {
                self.cpus = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            area.appendChild(card);
        },

        render() {
            const filtered = {};
            if (this.average)
                filtered.avgload = this.data.avgload;
            for (const k in this.type)
                if (this.type[k]) {
                    const ak = `current${k}`;
                    filtered[ak] = this.data[ak];
                    if (this.raw) {
                        const akr = `raw_${ak}`;
                        filtered[akr] = this.data[akr];
                    }
                }
            if (this.cpus)
                filtered.cpus = this.data.cpus.map(cpu_data => {
                    const cpu_filtered = {};
                    for (const k in this.type)
                        if (this.type[k]) {
                            cpu_filtered[k] = cpu_data[k];
                            if (this.raw) {
                                const ak = `raw_${k}`;
                                cpu_filtered[ak] = cpu_data[ak];
                            }
                        }
                    return cpu_filtered;
                });

            render(this.card_body_data, filtered);
        }
    },

    disk: {
        data: null,

        category: {
            r: true,
            w: true,
            t: true
        },
        total: true,
        speed: true,
        interval: true,

        init(area) {
            const [card, options_body, card_body_data] = create_card("Disk");
            this.card_body_data = card_body_data;

            const self = this;

            const desc = {
                r: "Read",
                w: "Write",
                t: "Transferred (Read + Write)"
            };
            for (const k in desc)
                options_body.appendChild(create_checkbox(desc[k], `disk-${k}`, this.category[k], function() {
                    self.category[k] = this.checked;
                    if (self.data !== null)
                        self.render();
                }));

            options_body.appendChild(create_checkbox("Total", "disk-total", this.total, function() {
                self.total = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            options_body.appendChild(create_checkbox("Speed", "disk-speed", this.speed, function() {
                self.speed = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            options_body.appendChild(create_checkbox("Interval", "disk-interval", this.interval, function() {
                self.interval = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            area.appendChild(card);
        },

        render() {
            const filtered = {};
            for (const k in this.category)
                if (this.category[k]) {
                    const ak = `${k}IO`;
                    if (this.total)
                        filtered[ak] = this.data[ak];
                    if (this.speed) {
                        const aks = `${ak}_sec`;
                        filtered[aks] = this.data[aks];
                    }
                }
            if (this.interval)
                filtered.ms = this.data.ms;

            render(this.card_body_data, filtered);
        }
    },

    network: {
        category: {
            r: true,
            t: true,
        },
        type: {
            bytes: true,
            dropped: true,
            errors: false,
            sec: true
        },
        interval: true,

        init(area) {
            const [card, options_body, card_body_data] = create_card("Network");
            this.card_body_data = card_body_data;

            const self = this;

            const category_desc = {
                r: "Received",
                t: "Transmitted"
            };
            for (const k in category_desc)
                options_body.appendChild(create_checkbox(category_desc[k], `network-${k}`, this.category[k], function() {
                    self.category[k] = this.checked;
                    if (self.data !== null)
                        self.render();
                }));

            const type_desc = {
                bytes: "Total Bytes",
                dropped: "Bytes Dropped",
                errors: "Errors",
                sec: "Speed"
            };
            for (const k in type_desc)
                options_body.appendChild(create_checkbox(type_desc[k], `network-${k}`, this.type[k], function() {
                    self.type[k] = this.checked;
                    if (self.data !== null)
                        self.render();
                }));

            options_body.appendChild(create_checkbox("Interval", "network-interval", this.interval, function() {
                self.interval = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            area.appendChild(card);
        },

        render() {
            render(this.card_body_data, this.data.map(in_data => {
                const in_filtered = { iface: in_data.iface, operstate: in_data.operstate };
                for (const type in this.type)
                    if (this.type[type])
                        for (const category in this.category)
                            if (this.category[category]) {
                                const ak = `${category}x_${type}`;
                                in_filtered[ak] = in_data[ak];
                            }
                if (this.interval)
                    in_filtered.ms = in_data.ms;
                return in_filtered;
            }));
        }
    },

    procs: {
        prev_data: null,

        type: {
            running: true,
            blocked: true,
            sleeping: true,
            unknown: true
        },
        proc: true,
        proc_type: {
            parentPid: false,
            pcpu: true,
            pcpuu: false,
            pcpus: false,
            pmem: true,
            priority: true,
            mem_vsz: false,
            mem_rss: false,
            nice: false,
            started: false,
            tty: false,
            user: true,
            command: true,
            params: true,
            path: true
        },

        init(area) {
            const [card, options_body, card_body_data] = create_card("Processes");
            this.card_body_data = card_body_data;

            const self = this;

            const desc = {
                running: "Running",
                blocked: "Blocked",
                sleeping: "Sleeping",
                unknown: "Unknown"
            };
            for (const k in desc)
                options_body.appendChild(create_checkbox(desc[k], `procs-${k}`, this.type[k], function() {
                    self.type[k] = this.checked;
                    if (self.data !== null)
                        self.render();
                }));

            options_body.appendChild(create_checkbox("Processes", "procs-proc", this.proc, function() {
                self.proc = this.checked;
                if (self.data !== null)
                    self.render();
            }));

            const proc_desc = {
                parentPid: "Process Parent ID",
                pcpu: "Process CPU Usage",
                pcpuu: "Process CPU Usage (User)",
                pcpus: "Process CPU Usage (System)",
                pmem: "Process Memory Usage",
                priority: "Process Priority",
                mem_vsz: "Process Virtual Memory Size",
                mem_rss: "Process Memory Resident Set Size",
                nice: "Process Nice Value",
                started: "Process Started Time",
                tty: "Process TTY",
                user: "User",
                command: "Process Command",
                params: "Process Parameters",
                path: "Process Path"
            };
            for (const k in proc_desc)
                options_body.appendChild(create_checkbox(proc_desc[k], `procs-proc-${k}`, this.proc_type[k], function() {
                    self.proc_type[k] = this.checked;
                    if (self.data !== null)
                        self.render();
                }));

            area.appendChild(card);
        },

        render() {
            const filtered = { all: this.data.all };
            for (const k in this.type)
                if (this.type[k])
                    filtered[k] = this.data[k];
            if (this.proc)
                filtered.list = this.data.list.map(proc_data => {
                    const proc_filtered = { pid: proc_data.pid, name: proc_data.name, state: proc_data.state };
                    for (const k in this.proc_type)
                        if (this.proc_type[k])
                            proc_filtered[k] = proc_data[k];
                    return proc_filtered
                });

            render(this.card_body_data, filtered);
        }
    }
}

function loaded() {
    socket = io("http://edcsystem.hopto.org/");
    const stream = fromEvent(socket, "data");

    const area = document.createElement("div");
    area.classList.add("card-group");
    document.body.appendChild(area);

    for (const key of ["load", "disk", "network", "procs"]) {
        const handler = handlers[key];
        handler.init(area);

        subs[key] = stream.pipe(
            pluck(key),
            filter(data => data !== undefined),
            tap(data => handler.data = data)
        ).subscribe(() => handler.render());
    }
}

function unloaded() {
    for (k in subs)
        subs[k].unsubscribe();
    socket.close();
}
