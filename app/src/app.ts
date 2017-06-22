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

    this.setListeners()

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


    })
  }
}

