// -------------------------- Initialisation -----------------------------------

// filter keys for later usage
const _num_buttons = Array(10);
document.querySelectorAll("body > div.container > button").forEach(element => {
    const text = element.innerHTML;
    if (/\d/.test(text)) {
        const digit = parseInt(text);
        _num_buttons[digit] = element;
        // override unnecessary listener definitions by arrow function
        element.onclick = () => press(digit);
    }
});

// -------------------------- Implementation -----------------------------------

// aliasing for naming consistency
const _set_display = setDisplay;
const _set_lock = setLock;

var _timer_active = false;
var _timer_elapse = 0;
var _text = "";
var _locked = false;
var _failed_times = 0;
var _pwd = "";
const _max_attempts = 3;

function _lock_input() {
    _num_buttons.forEach(element => element.disabled = true);
}

function _unlock_input() {
    _num_buttons.forEach(element => element.disabled = false);
}

function _reset() {
    if (_text) {
        _text = "";
        _set_display("");
        _timer_active = false;
        _timer_elapse = 0;
    }
}

function tick() {
    if (_timer_active) {
        // timer starts only if the user starts to press a digit
        _timer_elapse += 100;
        // this is roughly 10s with a minor bias of no more than 0.1s
        if (_timer_elapse > 10000) {
            alert(`You took 10 seconds to entre ${_text.length} digits, seriously?`);
            _reset();
        }
    }
}

function press(digit) {
    _timer_active = true;

    var length = _text.length;
    if (length < 4) {
        _text += digit
        ++length;
        _set_display(_text);
    }
    if (length == 4)
        _lock_input();
}

function buttonStar() {
    if (_text.length == 4)
        _unlock_input();
    _reset()
}

function buttonHash() {
    if (_text) {
        if (_locked) {
            if (_text == _pwd) {
                _set_lock(false);
                _locked = false;
                _failed_times = 0;
                _pwd = "";
            } else {
                ++_failed_times;
                alert(`Failed Attempt: ${_failed_times}.${_failed_times == _max_attempts ? " No more attempts are allowed." : ""}`);
            }
            if (_failed_times < _max_attempts)
                _unlock_input();
            else
                _lock_input();
        } else if (_text.length == 4) {
            _pwd = _text;
            _set_lock(true);
            _locked = true;
            _unlock_input();
        } else
            alert("Password must be 4 digits.")
    }
    _reset();
}
