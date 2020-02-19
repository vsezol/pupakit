import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'pupa-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingComponent {
  private _numberOfStars: number = 5;
  @Input() public set numberOfStars(v: number) {
    this._numberOfStars = v;
    this.initStars();
  }
  public stars: any[];
  @Input() public disabled: boolean;
  @Output() public change: EventEmitter<number> = new EventEmitter<number>();
  private _value: number = 0;
  get value(): number {
    return this._value;
  }

  @Input() set value(v: number) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
      this.change.emit(v);
    }
  }

  public onChange: (v: number) => void = (v: number) => {
    this.change.emit(v);
  };
  public onTouched: () => void = () => null;

  constructor(private readonly cdRef: ChangeDetectorRef) {
    this.initStars();
  }

  private initStars(): void {
    this.stars = new Array(this._numberOfStars).fill(null);
  }

  public writeValue(value: number): void {
    if ((value as any) instanceof Event) {
      return;
    }
    this.cdRef.markForCheck();
    this._value = value;
  }

  public setRating(v: number): void {
    if (this.disabled) {
      return;
    }
    this.value = v;
  }

  public registerOnChange(fn: (v: number) => void): void {
    this.onChange = (v: number): void => {
      this.change.emit(v);
      fn(v);
    };
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public onClick(value: number): void {
    if (this.disabled) {
      return;
    }
    this.value = value;
  }
}