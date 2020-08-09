var _timer_active = false
var _timer_elapse = 0

var _text = ""
var _locked = false
var _pwd = ""

document.querySelector(".indicator").innerHTML = "🔓"

function _reset() {
    _text = ""
    setDisplay("")
    _timer_active = false
    _timer_elapse = 0
}

function tick() {
    if (_timer_active) {
        _timer_elapse += 100
        if (_timer_elapse > 10000)
            _reset()
    }
}

function _insert(digit) {
    _timer_active = true

    if (_text.length < 4) {
        _text += digit
        setDisplay(_text)
    }
}

function button0() {
    _insert(0)
}

function button1() {
    _insert(1)
}

function button2() {
    _insert(2)
}

function button3() {
    _insert(3)
}

function button4() {
    _insert(4)
}

function button5() {
    _insert(5)
}

function button6() {
    _insert(6)
}

function button7() {
    _insert(7)
}

function button8() {
    _insert(8)
}

function button9() {
    _insert(9)
}

function buttonStar() {
    _reset()
}

function buttonHash() {
    if (_locked &&_text == _pwd) {
        setLock(false)
        _locked = false
        _pwd = ""
    } else if (!_locked && _text.length == 4) {
        _pwd = _text
        setLock(true)
        _locked = true
    }
    _reset()
}
