const _accepting_states = [3, 4];

const _transitions = [
    { b: 1 },
    { a: 2, c: 4 },
    { a: 3 },
    { a: 3 },
    { b: 5 },
    { c: 4 }
];

// there is always a 0 in the states history record
const _states = [0];
let _last_state = 0;
let _last = "";

function _longest_prefix_length(str) {
    let i = 0;
    while (i < _last.length && i < str.length &&_last[i] === str[i])
        ++i;
    return i;
}

function checkMatch(str) {
    // console.log(`"${str}" [${_states}] ${_last_state}`);

    const lpl = _longest_prefix_length(str);

    // `lpl <= _last.length && lpl <= str.length` at this point

    // trim the trailing states if shorter
    if (lpl < _last.length) {
        _states.length = lpl + 1;
        _last_state = _states[lpl];
    }

    // push the rest states into the record
    // if `lpl === str.length` then the following 2 `for` statements will be skipped

    // 6 is the implicit universal failure state, no further processing is required if in state 6
    for (var i = lpl; _last_state !== 6 && i < str.length; ++i) {
        const c = str[i];

        const t = _transitions[_last_state];
        if (c in t)
            _last_state = t[c];
        else
            _last_state = 6;
        _states.push(_last_state);
    }

    // no need to check if last state is 6, because `i < str.length` => `_last_state === 6`
    for (; i < str.length; ++i)
        _states.push(6);

    _last = str;

    // console.log(`[${_states}] ${_last_state}`);

    return _accepting_states.includes(_last_state);
}
