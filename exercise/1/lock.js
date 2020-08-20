// -------------------------- Implementation -----------------------------------

// aliasing for naming consistency
const _set_display = setDisplay;
const _set_lock = setLock;

var _timer_active = false;
var _timer_elapse = 0;
var _text = "";
var _locked = false;
var _failed_times = 0;
var _disabled = false;
var _pwd = "";
const _max_attempts = 3;

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
        // this is roughly 10s with a minor offset of no more than 0.1s
        if (_timer_elapse > 10000) {
            alert(`You took 10 seconds to entre ${_text.length} digits, seriously?`);
            _reset();
        }
    }
}

function _press(digit) {
    if (!_disabled) {
        _timer_active = true;

        var length = _text.length;
        if (length == 4)
            alert(`No more input will be accepted. ${digit} will be discarded.`)
        else if (length < 4) {
            _text += digit
            ++length;
            _set_display(_text);
        }
    }
}

// simpler declarations
for (let i = 0; i < 10; ++i)
    window[`button${i}`] = () => _press(i);

const buttonStar = _reset;

function buttonHash() {
    if (_text) {
        var length = _text.length;
        if (length == 4)
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
                if (_failed_times == _max_attempts)
                    _disabled = true;
            } else {
                _pwd = _text;
                _set_lock(true);
                _locked = true;
            }
        else
            alert(`Requires 4 digits, got ${length}`);
    }
    _reset();
}
