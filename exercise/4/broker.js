const record = {}

exports.emit = (type) => {
    record[type].forEach((_, handler) => { handler() })
}

exports.subscribe = (type, handler) => {
    record[type] = (record[type] ?? new Map()).set(handler, true)
}

exports.unsubscribe = (type, handler) => {
    record[type].delete(handler)
}
