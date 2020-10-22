import _ from "lodash";
import { Chart, ChartOptions } from "chart.js";
import { Observable } from "rxjs";
import { filter, map, pluck } from "rxjs/operators";

import { e } from "./render";

/**
 *
 * @param {string} title
 * @param {string} id
 * @param {(ev: Event) => void} onchange
 * @returns {HTMLDivElement}
 */
function create_checkbox(title, id, onchange) {
    /**
     * @type {HTMLInputElement}
     */
    const box = e("input", { class: "form-check-input", type: "checkbox", id});
    box.checked = true;
    box.onchange = onchange;
    return e("div", { class: "form-check" },
        box,
        e("label", { class: "form-check-label", for: id },
            title
        )
    );
}

/**
 * @type {ChartOptions}
 */
const options = {
    responsive: true,
    elements: {
        point:{
            radius: 0
        }
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
};

const x_ticks = _.times(60);

/**
 * @template D
 * @abstract
 */
export class Handler {
    /**
     * @param {string} id
     * @param {string} name
     * @param {Observable<any>} stream
     */
    constructor(id, name, stream) {
        /**
         * @type {HTMLAnchorElement}
         */
        this.nav = e("a", { class: "nav-link", id: `main-${id}-tab`, href: `#main-${id}`, role: "tab", "data-toggle": "pill", "aria-controls": `main-${id}` },
            name
        );

        /**
         * @type {HTMLDivElement}
         */
        this.content = e("div", { class: "tab-pane fade", id: `main-${id}`, role: "tabpanel", "aria-labelledby": `main-${id}-tab` });

        this.subscription = stream.pipe(
            pluck(id),
            filter(_.identity),
            map(data => this.update(data))
        ).subscribe(handler => handler.render());

        /**
         * @type {D?}
         */
        this.data = null;
    }

    /**
     * @abstract
     * @param {*} data
     * @returns {this}
     */
    update(data) {
        throw new Error("Abstract Method");
    }

    /**
     * @abstract
     */
    render() {
        throw new Error("Abstract Method");
    }

    cleanup() {
        this.subscription.unsubscribe();
    }
}

/**
 * @template T
 */
export class ChartRecord {
    /**
     * @param {string} id
     * @param {string} prefix
     * @param {string} label
     * @param {T} data
     */
    constructor(id, prefix, label, data) {
        /**
         * @type {number[]}
         */
        this.values = new Array(59).fill(0);
        this.label = label;
        this.values.push(data[id]);

        /**
         * @type {HTMLCanvasElement}
         */
        const canvas = this.canvas = e("canvas", { class: "card-body" });

        this.chart = new Chart(canvas.getContext("2d"), {
            type: "line",
            data: {
                labels: x_ticks,
                datasets: [
                    {
                        label,
                        borderColor: "rgb(54, 193, 235)",
                        backgroundColor: "rgba(54, 193, 235, 0.1)",
                        data: this.values
                    }
                ]
            },
            options
        });

        this.option = create_checkbox(label, `${prefix}-option-${id}`, function() {
            canvas.hidden = !this.checked;
        });
    }

    refresh() {
        this.chart.update({ duration: 0 });
    }
}

/**
 * @extends {Handler<import("./typings").LoadHandlerData>}
 */
export class LoadHandler extends Handler {
    /**
     * @param {import("./typings").LoadHandlerInput} data
     */
    update(data) {
        if (this.data) {
            _.forIn(this.data.current, ({ values }, key) => {
                values.push(data[key]);
                values.shift();
            })
            _.zip(this.data.cpus, data.cpus).forEach(([record, cpu_data]) => _.forIn(record, ({ values }, key) => {
                values.push(cpu_data[key]);
                values.shift();
            }));
        } else {
            this.data = {
                current: {
                    avgload: new ChartRecord("avgload", "load", "Average Load (%)", data),
                    currentload: new ChartRecord("currentload", "load", "Load (%)", data),
                    currentload_user: new ChartRecord("currentload_user", "load", "User Load (%)", data),
                    currentload_system: new ChartRecord("currentload_system", "load", "System Load (%)", data),
                    currentload_nice: new ChartRecord("currentload_nice", "load", "Positive Nice Load (%)", data),
                    currentload_idle: new ChartRecord("currentload_idle", "load", "Idle Load (%)", data),
                    currentload_irq: new ChartRecord("currentload_irq", "load", "System IRQ Load (%)", data)
                },
                cpus: _.map(data.cpus, (cpu_data, index) => {
                    const prefix = `load-cpu${index}`
                    return {
                        load: new ChartRecord("load", prefix, "Load (%)", cpu_data),
                        load_user: new ChartRecord("load_user", prefix, "User Load (%)", cpu_data),
                        load_system: new ChartRecord("load_system", prefix, "System Load (%)", cpu_data),
                        load_nice: new ChartRecord("load_nice", prefix, "Positive Nice Load (%)", cpu_data),
                        load_idle: new ChartRecord("load_idle", prefix, "Idle Load (%)", cpu_data),
                        load_irq: new ChartRecord("load_irq", prefix, "System IRQ Load (%)", cpu_data)
                    };
                })
            };

            this.content.appendChild(e("nav", { class: "nav nav-tabs", role: "tablist" },
                e("a", { class: "nav-link", id: "load-nav-current-tab", href: "#load-nav-current", role: "tab", "data-toggle": "tab", "aria-controls": "load-nav-current" },
                    "Overall"
                ),
                ..._.map(data.cpus, (_0, index) => e("a", { class: "nav-link", id: `load-nav-cpu${index}-tab`, href: `#load-nav-cpu${index}`, role: "tab", "data-toggle": "tab", "aria-controls": `load-nav-cpu${index}` },
                    `CPU ${index}`
                ))
            ));

            this.content.appendChild(e("div", { class: "tab-content" },
                e("div", { class: "tab-pane fade card", id: "load-nav-current", role: "tabpanel", "aria-labelledby": "load-nav-current-tab" },
                    e("div", { class: "card-header" },
                        ..._.map(this.data.current, ({ option }) => option)
                    ),
                    ..._.map(this.data.current, ({ canvas }) => canvas)
                ),
                ..._.map(this.data.cpus, (record, index) => e("div", { class: "tab-pane fade card", id: `load-nav-cpu${index}`, role: "tabpanel", "aria-labelledby": `load-nav-cpu${index}-tab` },
                e("div", { class: "card-header" },
                    ..._.map(record, ({ option }) => option)
                ),
                ..._.map(record, ({ canvas }) => canvas)
            ))
            ));
        }
        return this;
    }

    render() {
        _.forIn(this.data.current, record => record.refresh());
        _.each(this.data.cpus, cpu_data => _.forIn(cpu_data, record => record.refresh()));
    }
}

/**
 * @extends {Handler<import("./typings").DiskHandlerData>}
 */
export class DiskHandler extends Handler {
    /**
     * @param {import("./typings").DiskHandlerInput} data
     */
    update(data) {
        if (this.data)
            _.forIn(this.data, ({ values }, key) => {
                values.push(data[key]);
                values.shift();
            });
        else {
            this.data = {
                rIO: new ChartRecord("rIO", "disk", "Read Total (bytes)", data),
                rIO_sec: new ChartRecord("rIO_sec", "disk", "Read Speed (bytes/second)", data),
                wIO: new ChartRecord("wIO", "disk", "Write Total (bytes)", data),
                wIO_sec: new ChartRecord("wIO_sec", "disk", "Write Speed (bytes/second)", data),
                tIO: new ChartRecord("tIO", "disk", "Transferred (Read + Write) Total (bytes)", data),
                tIO_sec: new ChartRecord("tIO_sec", "disk", "Transferred (Read + Write) Speed (bytes/second)", data),
                ms: new ChartRecord("ms", "disk", "Interval (second)", data)
            };

            this.content.appendChild(e("div", { class: "card" },
                e("div", { class: "card-header" },
                    ..._.map(this.data, ({ option }) => option)
                ),
                ..._.map(this.data, ({ canvas }) => canvas)
            ));
        }
        return this;
    }

    render() {
        _.forIn(this.data, record => record.refresh());
    }
}

/**
 * @extends {Handler<Object<string, import("./typings").NetworkHandlerData>>}
 */
export class NetworkHandler extends Handler {
    /**
     *
     * @param {import("./typings").NetworkHandlerInput} data
     */
    update(data) {
        if (this.data)
            _.each(data, data => {
                _.forIn(this.data[data.iface], ({ values }, key) => {
                    values.push(data[key]);
                    values.shift();
                });
            });
        else {
            this.data = _.chain(data)
                .keyBy("iface")
                .mapValues(data => {
                    const prefix = `network-${data.iface}`;
                    return {
                        rx_bytes: new ChartRecord("rx_bytes", prefix, "Received Total (bytes)", data),
                        tx_bytes: new ChartRecord("tx_bytes", prefix, "Transmitted Total (bytes)", data),
                        rx_dropped: new ChartRecord("rx_dropped", prefix, "Received Dropped (bytes)", data),
                        tx_dropped: new ChartRecord("tx_dropped", prefix, "Transmitted Dropped (bytes)", data),
                        rx_errors: new ChartRecord("rx_errors", prefix, "Received Errors (bytes)", data),
                        tx_errors: new ChartRecord("tx_errors", prefix, "Transmitted Errors (bytes)", data),
                        rx_sec: new ChartRecord("rx_sec", prefix, "Received Speed (bytes/second)", data),
                        tx_sec: new ChartRecord("rx_sec", prefix, "Transmitted Speed (bytes/second)", data),
                        ms: new ChartRecord("ms", prefix, "Interval (second)", data),
                    };
                }).value();

            this.content.append(e("nav", { class: "nav nav-tabs", role: "tablist" },
                ..._.map(data, ({ iface, operstate }) => e("a", { class: "nav-link", id: `network-nav-${iface}-tab`, href: `#network-nav-${iface}`, role: "tab", "data-toggle": "tab", "aria-controls": `network-nav-${iface}` },
                    `${iface} (${operstate})`
                ))
            ));

            this.content.append(e("div", { class: "tab-content" }),
                ..._.map(this.data, (record, iface) => {
                    return e("div", { class: "tab-pane fade card", id: `network-nav-${iface}`, role: "tabpanel", "aria-labelledby": `network-nav-${iface}-tab` },
                        e("div", { class: "card-header" },
                            ..._.map(record, ({ option }) => option)
                        ),
                        ..._.map(record, ({ canvas }) => canvas)
                    );
                })
            );
        }
        return this;
    }

    render() {
        _.each(this.data, interface_record => _.forIn(interface_record, record => record.refresh()));
    }
}

class ProcessTable {
    /**
     *
     * @param {import("./typings").ProcessesDetails} data
     */
    constructor(data) {
        /**
         * @param {number} v
         */
        const percentage = v => v.toFixed(0);

        this.labels = {
            name: { enable: true, name: "Name", process: _.identity },
            state: { enable: true, name: "State", process: _.identity },
            user: { enable: true, name: "User", process: _.identity },
            pcpu: { enable: true, name: "CPU Usage (%)", process: percentage },
            pmem: { enable: true, name: "Memory Usage (%)", process: percentage },
            priority: { enable: true, name: "Priority", process: _.identity },
            parentPid: { enable: true, name: "Parent ID", process: _.identity },
            command: { enable: true, name: "Starting Command", process: _.identity },
            pcpuu: { enable: true, name: "CPU Usage (User) (%)", process: percentage },
            pcpus: { enable: true, name: "CPU Usage (System) (%)", process: percentage },
            mem_vsz: { enable: true, name: "Virtual Memory Size", process: _.identity },
            mem_rss: { enable: true, name: "Memory Resident Set Size", process: _.identity },
            nice: { enable: true, name: "Nice Value", process: _.identity },
            started: { enable: true, name: "Start Time", process: _.identity },
            tty: { enable: true, name: "TTY", process: _.identity },
            params: { enable: true, name: "Parameters", process: _.identity },
            path: { enable: true, name: "Path", process: _.identity }
        };

        this.data = data;

        const self = this;

        /**
         * @type {HTMLDivElement}
         */
        this.options = e("div", { class: "card-header" },
            ..._.map(this.labels, (value, key) => create_checkbox(value.name, `procs-option-${key}`, function () {
                value.enable = this.checked;
                self.refresh();
            }))
        );

        /**
         * @type {HTMLTableSectionElement}
         */
        this.thead = this.generate_thead();

        /**
         * @type {HTMLTableSectionElement}
         */
        this.tbody = this.generate_tbody();

        /**
         * @type {HTMLTableElement}
         */
        this.table = e("table", { class: "card-body table table-sm table-responsive" },
            this.thead,
            this.tbody
        );
    }

    /**
     * @returns {HTMLTableSectionElement}
     */
    generate_thead() {
        return e("thead", {},
            e("tr", {},
                e("th", { class: "text-center", scope: "col" }, "#"),
                ..._.map(this.labels, ({ enable, name }) => enable ? e("th", { class: "text-center", scope: "col" },name) : "")
            )
        );
    }

    /**
     * @returns {HTMLTableSectionElement}
     */
    generate_tbody() {
        return e("tbody", {},
            ..._.map(this.data, data => e("tr", {},
                e("th", { class: "text-center", scope: "row" }, data.pid.toString()),
                ..._.map(this.labels, ({ enable, process }, key) => enable ? e("td", { class: "text-center" }, process(data[key])) : "")
            ))
        );
    }

    /**
     *
     * @param {import("./typings").ProcessesDetails} data
     */
    update(data) {
        this.data = data;
    }

    refresh() {
        const thead = this.generate_thead(), tbody = this.generate_tbody();
        this.table.replaceChild(thead, this.thead);
        this.table.replaceChild(tbody, this.tbody);
        this.thead = thead;
        this.tbody = tbody;
    }
}

/**
 * @extends {Handler<import("./typings").ProcessesHandlerData>}
 */
export class ProcessesHandler extends Handler {
    /**
     * @param {import("./typings").ProcessesHandlerInput} data
     */
    update(data) {
        if (this.data) {
            _.forIn(this.data, ({ values }, key) => {
                values.push(data[key]);
                values.shift();
            })
            this.table.update(data.list);
        } else {
            this.data = {
                all: new ChartRecord("all", "procs-graph", "All Processes", data),
                running: new ChartRecord("running", "procs-graph", "All Running Processes", data),
                blocked: new ChartRecord("blocked", "procs-graph", "All Blocked Processes", data),
                sleeping: new ChartRecord("sleeping", "procs-graph", "All Sleeping Processes", data),
                unknown: new ChartRecord("unknown", "procs-graph", "All Unknown Processes", data)
            };
            this.table = new ProcessTable(data.list);

            this.content.appendChild(e("nav", { class: "nav nav-tabs", role: "tablist" },
                e("a", { class: "nav-link", id: "procs-nav-graph-tab", href: "#procs-nav-graph", role: "tab", "data-toggle": "tab", "aria-controls": "procs-nav-graph" },
                    "Graph"
                ),
                e("a", { class: "nav-link", id: "procs-nav-details-tab", href: "#procs-nav-details", role: "tab", "data-toggle": "tab", "aria-controls": "procs-nav-details" },
                    "Details"
                )
            ));

            this.content.appendChild(e("div", { class: "tab-content" },
                e("div", { class: "tab-pane fade card", id: "procs-nav-graph", role: "tabpanel", "aria-labelledby": "procs-nav-graph-tab" },
                    e("div", { class: "card-header" },
                        ..._.map(this.data, ({ option }) => option)
                    ),
                    ..._.map(this.data, ({ canvas }) => canvas)
                ),
                e("div", { class: "tab-pane fade card", id: "procs-nav-details", role: "tabpanel", "aria-labelledby": "procs-nav-details-tab" },
                    this.table.options,
                    this.table.table
                )
            ));
        }
        return this;
    }

    render() {
        _.each(this.data, record => record.refresh());
        this.table.refresh();
    }
}
