var Slider = (function () {
    function Slider(_a) {
        var _this = this;
        var container = _a.container, _b = _a.color, color = _b === void 0 ? '#ff0000' : _b, _c = _a.max, max = _c === void 0 ? 100 : _c, _d = _a.min, min = _d === void 0 ? 0 : _d, _e = _a.step, step = _e === void 0 ? 1 : _e, _f = _a.radius, radius = _f === void 0 ? 100 : _f, onChange = _a.onChange;
        this.wheelId = "wheel_" + document.getElementsByClassName("wheel").length;
        this.wheelTemplate = "\n<div class=\"wheel\" id=\"" + this.wheelId + "\">\n    <div class=\"wheel-progress\">\n      <svg width=\"200\" height=\"200\">\n        <path class=\"wheel-progress-fill\"></path>\n      </svg>\n    </div>\n    <div class=\"wheel-center\">\n      <span class=\"wheel-value\"></span>\n    </div>\n    <a href=\"javascript:void(0)\" class=\"wheel-handle\"></a>\n  </div>";
        this.update = function (ev) {
            if (!_this.mousedown)
                return;
            ev.preventDefault();
            var evParsed = _this.handleMouseTouch(ev);
            var dX = evParsed.pageX - (window.pageXOffset + _this.wheelBounds.left + _this.wheelBounds.width / 2);
            var dY = evParsed.pageY - (window.pageYOffset + _this.wheelBounds.top + _this.wheelBounds.height / 2);
            var rad = Math.atan2(dY, dX);
            var radius_minus_handle = (_this.wheelBounds.width - _this.handleBounds.width) / 2;
            _this.handle.style.left = Math.cos(rad) * radius_minus_handle + (_this.wheelBounds.width / 2) + 'px';
            _this.handle.style.top = Math.sin(rad) * radius_minus_handle + (_this.wheelBounds.height / 2) + 'px';
            var deg = rad * (180 / Math.PI);
            // Convert radians to degrees relative to positive y-axis
            if (deg <= 0 && deg >= -90) {
                deg = 90 + deg;
            }
            else if (deg < -90) {
                deg = 270 + 180 + deg;
            }
            else {
                deg += 90;
            }
            _this.arc.setAttribute('d', _this.describeArc(_this.options.radius, _this.options.radius, _this.options.radius - 10, 0, deg));
            // Calculate new value
            var newValue = _this.options.min + deg * (_this.options.max - _this.options.min) / 360;
            var rounded = Math.ceil(newValue / _this.options.step) * _this.options.step;
            if (Math.abs(rounded - _this.value) >= _this.options.step) {
                _this.value = rounded;
                if (typeof _this.onChange === 'function') {
                    _this.onChange(rounded);
                }
            }
            // Update bounds
            _this.wheelBounds = _this.wheel.getBoundingClientRect();
            _this.handleBounds = _this.handle.getBoundingClientRect();
        };
        this.options = {
            color: color,
            max: max,
            min: min,
            step: step,
            radius: radius
        };
        this.value = min;
        this.onChange = onChange;
        this.mousedown = false;
        this.container = container;
        this.insertWheel(radius);
        Slider.wheelsRegistry.push(this);
        // Window listeners, so we can dispatch events correctly
        ['mousedown', 'touchstart'].forEach(function (event) {
            window.addEventListener(event, function (ev) {
                for (var _i = 0, _a = Slider.wheelsRegistry; _i < _a.length; _i++) {
                    var wheel = _a[_i];
                    if (_this.isClickWithinClientRect(ev, wheel.handleBounds)) {
                        wheel.handle.dispatchEvent(ev.type === 'touchstart' ? new Event('touchstart') : new Event('mousedown'));
                        ev.stopPropagation();
                    }
                }
            });
        });
        ['click', 'touch'].forEach(function (event) {
            window.addEventListener(event, function (ev) {
                for (var _i = 0, _a = Slider.wheelsRegistry; _i < _a.length; _i++) {
                    var wheel = _a[_i];
                    if (_this.isClickInWheelArc(ev, wheel)) {
                        wheel.mousedown = true;
                        wheel.update(ev);
                        wheel.mousedown = false;
                        ev.stopPropagation();
                    }
                }
            });
        });
        /* Set listeners */
        ['mousedown', 'touchstart'].forEach(function (event) {
            _this.handle.addEventListener(event, function (ev) {
                _this.mousedown = true;
                ev.preventDefault();
                _this.handle.focus();
            });
        });
        ['mouseup', 'touchend'].forEach(function (event) {
            window.addEventListener(event, function () { return _this.mousedown = false; });
        });
        ['mousemove', 'touchmove'].forEach(function (event) {
            window.addEventListener(event, _this.update);
        });
        window.addEventListener('scroll', function (ev) {
            // Update bounds
            _this.wheelBounds = _this.wheel.getBoundingClientRect();
            _this.handleBounds = _this.handle.getBoundingClientRect();
        });
    }
    Slider.prototype.insertWheel = function (radius) {
        this.container.insertAdjacentHTML('beforeend', this.wheelTemplate);
        this.wheel = document.getElementById(this.wheelId);
        this.wheel.style.width = 2 * radius + "px";
        this.wheel.style.height = 2 * radius + "px";
        this.wheel.style.borderRadius = radius + "px";
        this.wheelBounds = this.wheel.getBoundingClientRect();
        var svg = this.wheel.getElementsByTagName('svg')[0];
        svg.style.width = 2 * radius + "px";
        svg.style.height = 2 * radius + "px";
        var wheelCenter = this.wheel.getElementsByClassName('wheel-center')[0];
        wheelCenter.style.width = (2 * radius - 40) + "px";
        wheelCenter.style.height = (2 * radius - 40) + "px";
        wheelCenter.style.borderRadius = (radius - 20) + "px";
        this.handle = this.wheel.getElementsByClassName('wheel-handle')[0];
        this.handle.style.backgroundColor = this.options.color;
        this.handleBounds = this.handle.getBoundingClientRect();
        this.arc = this.wheel.getElementsByClassName('wheel-progress-fill')[0];
        var rgbColor = this.hexToRgb(this.options.color);
        this.arc.style.stroke = "rgba(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ",0.5)";
    };
    /* Util functions */
    Slider.prototype.handleMouseTouch = function (ev) {
        var pageX, pageY;
        if (ev.touches) {
            pageX = ev.touches[0].pageX;
            pageY = ev.touches[0].pageY;
        }
        else {
            pageX = ev.pageX;
            pageY = ev.pageY;
        }
        return { pageX: pageX, pageY: pageY };
    };
    Slider.prototype.hexToRgb = function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    Slider.prototype.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };
    Slider.prototype.isClickWithinClientRect = function (ev, rect) {
        console.log(ev, rect);
        var evParsed = this.handleMouseTouch(ev);
        var xWithin = (rect.left) <= evParsed.pageX && evParsed.pageX <= (rect.left + rect.width);
        var yWithin = (rect.top) <= evParsed.pageY && evParsed.pageY <= (rect.top + rect.height);
        return xWithin && yWithin;
    };
    Slider.prototype.isClickInWheelArc = function (ev, wheel) {
        var evParsed = this.handleMouseTouch(ev);
        var dX = evParsed.pageX - (window.pageXOffset + wheel.wheelBounds.left) - wheel.wheelBounds.width / 2;
        var dY = evParsed.pageY - (window.pageYOffset + wheel.wheelBounds.top) - wheel.wheelBounds.height / 2;
        var fromCenter = Math.sqrt(dX * dX + dY * dY);
        return fromCenter < wheel.options.radius && fromCenter > (wheel.options.radius - 20);
    };
    // Ref: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
    // Or we could use d3...
    Slider.prototype.describeArc = function (x, y, radius, startAngle, endAngle) {
        var start = this.polarToCartesian(x, y, radius, endAngle);
        var end = this.polarToCartesian(x, y, radius, startAngle);
        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };
    Slider.wheelsRegistry = [];
    return Slider;
}());
