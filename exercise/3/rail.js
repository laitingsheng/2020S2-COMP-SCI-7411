const _marking = {}
const _str = {}

const _directions = {
    e: "East",
    w: "West",
    East: "e",
    West: "w"
}

Object.freeze(_directions)

const _record = {}

for (const i of [1, 4, 8]){
    const di = `d${i}`
    _marking[di] = 1
    _str[di] = di
}

for (const i of [3, 9]){
    const oi = `o${i}`
    _marking[oi] = 1
    _str[oi] = oi
}

function* _range(start, end) {
    for (i = start; i < end; ++i)
        yield i
}

// some states are useless, this is just a shorter initialisation
for (const i of _range(1, 14)) {
    const pi =`p${i}`
    _marking[pi] = 1
    _str[pi] = pi
    const pi_e = `p${i}_e`
    _marking[pi_e] = 0
    _str[pi_e] = pi_e
    const pi_w = `p${i}_w`
    _marking[pi_w] = 0
    _str[pi_w] = pi_w

    _record[i] = undefined
}

Object.seal(_marking)
Object.freeze(_str)
Object.seal(_record)

// This is a collection of all possible transitions in the Petri Net as said in the plan
const _transitions = {
    d1: [
        [[_str.d1, _str.p1], [_str.d1, _str.p1_e]]
    ],
    d4: [
        [[_str.d4, _str.p4], [_str.d4, _str.p4_e]]
    ],
    d8: [
        [[_str.d8, _str.p8], [_str.d8, _str.p8_w]]
    ],
    p3_e: [
        [[_str.p3_e, _str.o3], [_str.p3, _str.o3]]
    ],
    p9_w: [
        [[_str.p9_w, _str.o9], [_str.p9, _str.o9]]
    ],

    p1_e: [
        [[_str.p1_e, _str.p2], [_str.p1, _str.p2_e]],
        [[_str.p1_e, _str.p6], [_str.p1, _str.p6_e]],
        [[_str.p1_e, _str.p11], [_str.p1, _str.p11_e]]
    ],
    p2_e: [
        [[_str.p2_e, _str.p3], [_str.p2, _str.p3_e]]
    ],
    p6_e: [
        [[_str.p6_e, _str.p3], [_str.p6, _str.p3_e]]
    ],
    p11_e: [
        [[_str.p11_e, _str.p3], [_str.p11, _str.p3_e]]
    ],
    p8_w: [
        [[_str.p8_w, _str.p12], [_str.p8, _str.p12_w]],
        [[_str.p8_w, _str.p7], [_str.p8, _str.p7_w]]
    ],
    p5_w: [
        [[_str.p5_w, _str.p9], [_str.p5, _str.p9_w]]
    ],
    p10_w: [
        [[_str.p10_w, _str.p9], [_str.p10, _str.p9_w]]
    ],

    p5_e: [
        [[_str.p5_e, _str.p6], [_str.p5, _str.p6_e]],
        [[_str.p5_e, _str.p11], [_str.p5, _str.p11_e]]
    ],
    p10_e: [
        [[_str.p10_e, _str.p11], [_str.p10, _str.p11_e]]
    ],
    p6_w: [
        [[_str.p6_w, _str.p5], [_str.p6, _str.p5_w]]
    ],
    p11_w: [
        [[_str.p11_w, _str.p10], [_str.p11, _str.p10_w]],
        [[_str.p11_w, _str.p5], [_str.p11, _str.p5_w]]
    ],
    p13_w: [
        [[_str.p13_w, _str.p10], [_str.p13, _str.p10_w]]
    ],

    // special transitions
    p4_e: [
        [[_str.p4_e, _str.p5, _str.p6], [_str.p4, _str.p5_e, _str.p6]],
        [[_str.p4_e, _str.p5, _str.p6_e], [_str.p4, _str.p5_e, _str.p6_e]],
        [[_str.p4_e, _str.p5, _str.p11], [_str.p4, _str.p5_e, _str.p11]],
        [[_str.p4_e, _str.p5, _str.p11_e], [_str.p4, _str.p5_e, _str.p11_e]],
        [[_str.p4_e, _str.p5, _str.p10], [_str.p4, _str.p5_e, _str.p10]],
        [[_str.p4_e, _str.p5, _str.p10_w], [_str.p4, _str.p5_e, _str.p10_w]],

        [[_str.p4_e, _str.p10, _str.p11], [_str.p4, _str.p10_e, _str.p11]],
        [[_str.p4_e, _str.p10, _str.p11_e], [_str.p4, _str.p10_e, _str.p11_e]],
        // unnecessary to check if track 5 is empty as the selection here naturally prioritise track 5 over track 10
        [[_str.p4_e, _str.p10, _str.p5_w], [_str.p4, _str.p10_e, _str.p5_w]],
        [[_str.p4_e, _str.p10, _str.p6], [_str.p4, _str.p10_e, _str.p6]],
        [[_str.p4_e, _str.p10, _str.p6_e], [_str.p4, _str.p10_e, _str.p6_e]]
    ],
    p7_w: [
        [[_str.p7_w, _str.p11, _str.p10], [_str.p7, _str.p11_w, _str.p10]],
        [[_str.p7_w, _str.p11, _str.p10_w], [_str.p7, _str.p11_w, _str.p10_w]],
        [[_str.p7_w, _str.p11, _str.p5], [_str.p7, _str.p11_w, _str.p5]],
        [[_str.p7_w, _str.p11, _str.p5_w], [_str.p7, _str.p11_w, _str.p5_w]],
        [[_str.p7_w, _str.p11, _str.p6], [_str.p7, _str.p11_w, _str.p6]],
        [[_str.p7_w, _str.p11, _str.p6_e], [_str.p7, _str.p11_w, _str.p6_e]],

        [[_str.p7_w, _str.p6, _str.p5], [_str.p7, _str.p6_w, _str.p5]],
        [[_str.p7_w, _str.p6, _str.p5_w], [_str.p7, _str.p6_w, _str.p5_w]],
        // no need to check if track 11 is empty similar to above
        [[_str.p7_w, _str.p6, _str.p11_e], [_str.p7, _str.p6_w, _str.p11_e]],
        [[_str.p7_w, _str.p6, _str.p10], [_str.p7, _str.p6_w, _str.p10]],
        [[_str.p7_w, _str.p6, _str.p10_w], [_str.p7, _str.p6_w, _str.p10_w]]
    ],
    p12_w: [
        [[_str.p12_w, _str.p13], [_str.p12, _str.p13_w]],

        [[_str.p12_w, _str.p11, _str.p10], [_str.p12, _str.p11_w, _str.p10]],
        [[_str.p12_w, _str.p11, _str.p10_w], [_str.p12, _str.p11_w, _str.p10_w]],
        [[_str.p12_w, _str.p11, _str.p5], [_str.p12, _str.p11_w, _str.p5]],
        [[_str.p12_w, _str.p11, _str.p5_w], [_str.p12, _str.p11_w, _str.p5_w]],
        [[_str.p12_w, _str.p11, _str.p6], [_str.p12, _str.p11_w, _str.p6]],
        [[_str.p12_w, _str.p11, _str.p6_e], [_str.p12, _str.p11_w, _str.p6_e]]
    ]
}

Object.freeze(_transitions)

const _precheck = pre => _marking[pre] === 1

const _trigger = state => {
    for (const [pres, posts] of _transitions[state])
        if (pres.every(_precheck)) {
            for (const pre of pres)
                _marking[pre] = 0
            for (const post of posts)
                _marking[post] = 1
            return posts[1]
        }
}

const _re = /^([dop])(\d{1,2})(?:_([ew]))?$/

const _parse = ss => {
    const [, place, track, direction] = ss.match(_re)
    return [place, parseInt(track, 10), _directions[direction]]
}

const _filter = i => i !== undefined

const _render = () => updateYard(Object.values(_record).filter(_filter))

var _count = 1

const _new = i => {
    if (_record[i] === undefined) {
        const [place, track, direction] = _parse(_trigger(`d${i}`))
        if (place == "p") {
            _record[i] = {
                name: `Train${_count++}`,
                direction: direction,
                blockSection: track
            }
            _render()
        } else {
            alert("impossible movement, the marking is now corrupted, refreshing the page")
            location.reload()
        }
    } else
        alert(`Track ${i} already has a train`)
}

for (const [d, i] of [[_directions.e, 1], [_directions.e, 4], [_directions.w, 8]])
    window[`newTrain${d}${i}`] = () => _new(i)

const trainMove = train => {
    const {blockSection, direction} = train
    if (_record[blockSection] === undefined)
        alert(`Unexpected train ${JSON.stringify(train)}`)
    else {
        const re = _trigger(`p${blockSection}_${_directions[direction]}`)
        if (re === undefined)
            alert(`Train ${JSON.stringify(train)} cannot move`)
        else {
            const [place, track, new_direction] = _parse(re)
            if (place == "d") {
                alert("impossible movement, the marking is now corrupted, refreshing the page")
                location.reload()
            } else if (place == "o") {
                _record[blockSection] = undefined
                _render()
            } else if (new_direction != direction || _record[track] !== undefined) {
                alert("inconsistent result, the marking is now corrupted, refreshing the page")
                location.reload()
            } else {
                _record[blockSection] = undefined
                if (place == "p") {
                    train.blockSection = track
                    _record[track] = train
                }
                _render()
            }
        }
    }
}
