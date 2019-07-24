import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { DropdownItem } from '../../../src/lib/core/components/dropdown/dropdown.component';
import { Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'demo-select',
  styleUrls: ['../demo.scss', './select-demo.component.scss'],
  templateUrl: './select-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectDemoComponent {
  public positionChange$: Subject<void> = new Subject<void>();

  private detect: boolean = false;

  public lorems: string[] = `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
  Beatae cum cupiditate eos ex facilis, fuga fugiat modi natus nisi obcaecati possimus reprehenderit.
  Animi deleniti illo modi officia rem sapiente! Sint!`.split(' ');

  public icons: string[] = ['airplane', 'add', 'arrow-forward'];

  public items: DropdownItem<string>[] = this.lorems.map((lorem: string, index: number) => ({
    caption: lorem,
    data: lorem,
    iconLeft: {
      name: this.icons[index % this.icons.length],
      color: getRandomColor()
    },
    iconRight: {
      name: this.icons[(index + 1) % this.icons.length],
      color: getRandomColor()
    }
  }));

  public form: FormGroup = new FormGroup({
    select: new FormControl()
  });

  constructor() {
    /* tslint:disable */
    this.form.valueChanges.subscribe(console.log);
    /* tslint:enable */
  }

  public onMousedown(): void {
    this.detect = true;
  }

  @HostListener('window:mouseup')
  public stopDetect(): void {
    this.detect = false;
  }

  @HostListener('window:mousemove')
  public checkPos(): void {
    if (!this.detect) {
      return;
    }
    this.positionChange$.next();
  }
}

function getRandomColor(): string {
  const letters: string = '0123456789ABCDEF';
  let color: string = '#';
  const six: number = 6;
  const sixteen: number = 16;
  for (let i: number = 0; i < six; i++) {
    color += letters[Math.floor(Math.random() * sixteen)];
  }
  return color;
}