import _ from "lodash";

/**
 * @param {*} tag
 * @param {Object<string, string>} props
 * @param {(Node | string)[]} children
 */
export function e(tag, props, ...children) {
    const element = document.createElement(tag);
    _.forIn(props, (v, k) => element.setAttribute(k, v));
    element.append(...children);
    return element;
}
