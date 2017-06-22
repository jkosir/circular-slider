interface Options {
  color: string,
  max: number,
  min: number,
  step: number,
  radius: number
}

class Slider {
  container: HTMLElement;
  handle: HTMLElement;
  arc: HTMLElement;
  options: Options;
  mousedown: boolean;
  wheelBounds: ClientRect;
  handleBounds: ClientRect;

  constructor({container, color = '#ff0000', max = 100, min = 0, step = 1, radius = 100}:{container: HTMLElement, color?: string, max?: number, min?: number, step?: number, radius?: number}) {
    this.options = {
      color: color,
      max: max,
      min: min,
      step: step,
      radius: radius
    };

    this.container = container;
    this.wheelBounds = container.getBoundingClientRect();
    this.handle = <HTMLElement>this.container.getElementsByClassName('wheel-handle')[0];
    this.handleBounds = this.handle.getBoundingClientRect();
    this.mousedown = false;

    this.arc = <HTMLElement>this.container.getElementsByClassName('wheel-progress-fill')[0];
    this.setListeners();

  }

  setListeners() {
    this.handle.addEventListener('mousedown', () => this.mousedown = true);
    window.addEventListener('mouseup', () => this.mousedown = false);

    document.addEventListener('mousemove', (ev) => {
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
        100,
        100,
        90,
        0,
        deg
      ));
    })
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

