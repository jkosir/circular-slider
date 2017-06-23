interface Options {
  color: string,
  max: number,
  min: number,
  step: number,
  radius: number
}

class Slider {
  container: HTMLElement;
  wheel: HTMLElement;
  handle: HTMLElement;
  arc: HTMLElement;
  options: Options;
  mousedown: boolean;
  wheelBounds: ClientRect;
  handleBounds: ClientRect;

  wheelTemplate = `
<div class="wheel" id="wheel">
    <div class="wheel-progress">
      <svg width="200" height="200">
        <path class="wheel-progress-fill"></path>
      </svg>
    </div>
    <div class="wheel-center">
      <span class="wheel-value"></span>
    </div>
    <a href="javascript:void(0)" class="wheel-handle"></a>
  </div>`;

  constructor({container, color = '#ff0000', max = 100, min = 0, step = 1, radius = 100}:{container: HTMLElement, color?: string, max?: number, min?: number, step?: number, radius?: number}) {
    this.options = {
      color: color,
      max: max,
      min: min,
      step: step,
      radius: radius
    };

    this.mousedown = false;
    this.container = container;
    this.insertWheel(radius);


    /* Set listeners */
    this.handle.addEventListener('mousedown', (ev) => {
      this.mousedown = true;
      ev.preventDefault();
      this.handle.focus();
    });
    window.addEventListener('mouseup', () => this.mousedown = false);
    window.addEventListener('mousemove', this.update);
  }

  insertWheel(radius) {
    this.container.innerHTML = this.wheelTemplate;

    this.wheel = <HTMLElement>this.container.getElementsByClassName('wheel')[0];
    this.wheel.style.width = `${2 * radius}px`;
    this.wheel.style.height = `${2 * radius}px`;
    this.wheel.style.borderRadius = `${radius}px`;
    this.wheelBounds = this.wheel.getBoundingClientRect();

    let svg = this.wheel.getElementsByTagName('svg')[0];
    svg.style.width = `${2 * radius}px`;
    svg.style.height = `${2 * radius}px`;

    let wheelCenter = <HTMLElement>this.wheel.getElementsByClassName('wheel-center')[0];
    wheelCenter.style.width = `${2 * radius - 40}px`;
    wheelCenter.style.height = `${2 * radius - 40}px`;
    wheelCenter.style.borderRadius = `${radius - 20}px`;

    this.handle = <HTMLElement>this.container.getElementsByClassName('wheel-handle')[0];
    this.handle.style.backgroundColor = this.options.color;
    this.handleBounds = this.handle.getBoundingClientRect();

    this.arc = <HTMLElement>this.container.getElementsByClassName('wheel-progress-fill')[0];
    let rgbColor = this.hexToRgb(this.options.color);
    this.arc.style.stroke = `rgba(${rgbColor.r},${rgbColor.g},${rgbColor.b},0.5)`
  }

  update = (ev: MouseEvent) => {
    if (!this.mousedown) return;
    ev.preventDefault();

    let dX = ev.pageX - (this.wheelBounds.left + this.wheelBounds.width / 2);
    let dY = ev.pageY - (this.wheelBounds.top + this.wheelBounds.height / 2);
    let rad = Math.atan2(dY, dX);

    let radius_minus_handle = (this.wheelBounds.width - this.handleBounds.width) / 2;
    this.handle.style.left = Math.cos(rad) * radius_minus_handle + (this.wheelBounds.width / 2) + 'px';
    this.handle.style.top = Math.sin(rad) * radius_minus_handle + (this.wheelBounds.height / 2) + 'px';

    let deg = rad * (180 / Math.PI);
    // Convert radians to degrees relative to positive y-axis
    if (deg <= 0 && deg >= -90) {
      deg = 90 + deg;
    } else if (deg < -90) {
      deg = 270 + 180 + deg;
    } else {
      deg += 90;
    }

    this.arc.setAttribute('d', this.describeArc(
      this.options.radius,
      this.options.radius,
      this.options.radius - 10,
      0,
      deg
    ));
  };

  hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
  }


  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  // Ref: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
  // Or we could use d3...
  describeArc(x, y, radius, startAngle, endAngle) {

    let start = this.polarToCartesian(x, y, radius, endAngle);
    let end = this.polarToCartesian(x, y, radius, startAngle);

    let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

  }
}

