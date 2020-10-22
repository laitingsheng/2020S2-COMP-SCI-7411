import _ from "lodash";
import { Chart, ChartOptions } from "chart.js";
import { Observable } from "rxjs";
import { filter, map, pluck } from "rxjs/operators";

/**
 * @param {number} length
 */
const empty_array = length => _.times(length, _.constant(0));

/**
 *
 * @param {string} title
 * @param {string} id
 * @param {(ev: Event) => void} handler
 */
function create_checkbox(title, id, handler) {
    const checkbox_group = document.createElement("div");
    checkbox_group.classList.add("form-check");

    const checkbox = document.createElement("input");
    checkbox.classList.add("form-check-input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = true;
    checkbox.onchange = handler;

    checkbox_group.appendChild(checkbox);

    const checkbox_label = document.createElement("label");
    checkbox_label.classList.add("form-check-label");
    checkbox_label.htmlFor = id;
    checkbox_label.innerText = title;

    checkbox_group.appendChild(checkbox_label);

    return checkbox_group;
}

const colour = "rgb(54, 162, 235)";

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
 */
export class Handler {
    /**
     * @param {string} id
     * @param {string} name
     * @param {Observable<any>} stream
     */
    constructor(id, name, stream) {
        this.id = id;
        this.name = name;

        const nav = this.nav = document.createElement("a");
        const content = this.content = document.createElement("div");

        /**
         * @type {D?}
         */
        this.data = null;

        nav.classList.add("nav-link");
        nav.id = `v-pills-${id}-tab`;
        nav.setAttribute("data-toggle", "pill");
        nav.href = `#v-pills-${id}`;
        nav.setAttribute("role", "tab");
        nav.setAttribute("aria-controls", `v-pills-${id}`);
        nav.setAttribute("aria-selected", "false");
        nav.innerText = name;

        content.classList.add("tab-pane", "fade");
        content.id = `v-pills-${id}`;
        content.setAttribute("role", "tabpanel");
        content.setAttribute("aria-labelledby", `v-pills-${id}-tab`)

        this.subscription = stream.pipe(
            pluck(id),
            filter(_.identity),
            map(data => this.update(data))
        ).subscribe(handler => handler.render());
    }

    /**
     * @param {*} data
     * @returns {this}
     */
    update(data) {
        throw new Error("Abstract Method");
    }

    render() {
        throw new Error("Abstract Method");
    }

    cleanup() {
        this.subscription.unsubscribe();
    }
}

export class LoadHandler extends Handler {
    /**
     * @param {*} data
     */
    update(data) {
        return this;
    }

    render() {}
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
        this.id = id;
        this.values = empty_array(59);
        this.label = label;
        this.values.push(data[id]);

        const canvas = this.canvas = document.createElement("canvas");
        canvas.classList.add("card-body");

        this.chart = new Chart(canvas.getContext("2d"), {
            type: "line",
            data: {
                labels: x_ticks,
                datasets: [
                    {
                        label,
                        borderColor: colour,
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
 * @extends Handler<import("./typings").DiskHandlerData>
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

            const wrapper = document.createElement("div");
            wrapper.classList.add("card");

            this.content.appendChild(wrapper);

            const header = document.createElement("div");
            header.classList.add("card-header");

            wrapper.appendChild(header);

            _.forIn(this.data, ({ option, canvas }) => {
                header.appendChild(option);
                wrapper.appendChild(canvas);
            });
        }
        return this;
    }

    render() {
        _.forIn(this.data, record => record.refresh());
    }
}

/**
 * @extends Handler<Object<string,import("./typings").NetworkHandlerData>>
 */
export class NetworkHandler extends Handler {
    /**
     *
     * @param {import("./typings").NetworkHandlerInput} data
     */
    update(data) {
        if (this.data) {}
        else {
            const nav_wrapper = document.createElement("nav");
            nav_wrapper.classList.add("nav", "nav-tabs");
            nav_wrapper.setAttribute("role", "tablist");

            this.content.appendChild(nav_wrapper);

            const content_wrapper = document.createElement("div");
            content_wrapper.classList.add("tab-content");

            this.content.appendChild(content_wrapper);

            this.data = {};

            _.each(data, (interface_data, index) => {
                const { iface, operstate } = interface_data;

                const nav = document.createElement("a");
                nav.classList.add("nav-link");
                nav.id = `network-nav-${iface}-tab`;
                nav.setAttribute("data-toggle", "tab");
                nav.href = `#network-nav-${iface}`;
                nav.setAttribute("role", "tab");
                nav.setAttribute("aria-controls", `network-nav-${iface}`);
                nav.innerText = `${iface} (${operstate})`;

                nav_wrapper.appendChild(nav);

                const content = document.createElement("div");
                content.classList.add("tab-pane", "fade");
                content.id = `network-nav-${iface}`;
                content.setAttribute("role", "tabpanel");
                content.setAttribute("aria-labelledby", `network-nav-${iface}-tab`);

                if (index === 0) {
                    nav.classList.add("active");
                    nav.setAttribute("aria-selected", "true");
                    content.classList.add("show", "active");
                } else
                    nav.setAttribute("aria-selected", "false");

                const prefix = `network-${iface}`;
                const record = this.data[iface] = {
                    rx_bytes: new ChartRecord("rx_bytes", prefix, "Received Total (bytes)", interface_data),
                    tx_bytes: new ChartRecord("tx_bytes", prefix, "Transmitted Total (bytes)", interface_data),
                    rx_dropped: new ChartRecord("rx_dropped", prefix, "Received Dropped (bytes)", interface_data),
                    tx_dropped: new ChartRecord("tx_dropped", prefix, "Transmitted Dropped (bytes)", interface_data),
                    rx_errors: new ChartRecord("rx_errors", prefix, "Received Errors (bytes)", interface_data),
                    tx_errors: new ChartRecord("tx_errors", prefix, "Transmitted Errors (bytes)", interface_data),
                    rx_sec: new ChartRecord("rx_sec", prefix, "Received Speed (bytes/second)", interface_data),
                    tx_sec: new ChartRecord("rx_sec", prefix, "Transmitted Speed (bytes/second)", interface_data),
                    ms: new ChartRecord("ms", prefix, "Interval (second)", interface_data),
                };

                const wrapper = document.createElement("div");
                wrapper.classList.add("card");

                content_wrapper.appendChild(wrapper);

                const header = document.createElement("div");
                header.classList.add("card-header");

                wrapper.appendChild(header);

                _.forIn(record, ({ option, canvas }) => {
                    header.appendChild(option);
                    wrapper.appendChild(canvas);
                });
            });
        }
        return this;
    }

    render() {}
}

export class ProcessesHandler extends Handler {
    /**
     * @param {*} data
     */
    update(data) {
        return this;
    }

    render() {}
}
