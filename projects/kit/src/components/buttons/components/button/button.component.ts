import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ComponentChange, ComponentChanges } from '@bimeister/pupakit.common';
import { filterTruthy, isNil, Nullable } from '@bimeister/utilities';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ButtonKind } from '../../../../declarations/types/button-kind.type';
import { ButtonSize } from '../../../../declarations/types/button-size.type';
import { ButtonType } from '../../../../declarations/types/button-type.type';

@Component({
  selector: 'pupa-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements OnChanges {
  @Input() public size: ButtonSize = 'l';
  public readonly size$: BehaviorSubject<ButtonSize> = new BehaviorSubject<ButtonSize>('l');

  @Input() public kind: ButtonKind = 'primary';
  public readonly kind$: BehaviorSubject<ButtonKind> = new BehaviorSubject<ButtonKind>('primary');

  @Input() public type: ButtonType = 'button';
  public readonly type$: BehaviorSubject<ButtonType> = new BehaviorSubject<ButtonType>('button');

  @Input() public disabled: boolean = false;
  public readonly disabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() public leftIcon: Nullable<string>;
  public readonly leftIcon$: BehaviorSubject<Nullable<string>> = new BehaviorSubject<Nullable<string>>(null);

  @Input() public rightIcon: Nullable<string>;
  public readonly rightIcon$: BehaviorSubject<Nullable<string>> = new BehaviorSubject<Nullable<string>>(null);

  public readonly isReversedDirection$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() public loading: boolean = false;
  public readonly loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() public active: boolean = false;
  public readonly active$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() public tabIndex: string = '0';

  @Input() public flexible: boolean = false;
  public readonly flexible$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @HostBinding('class.flexible') public hasFlexibleClass: boolean = false;

  protected commonButtonClasses: Observable<string>[] = [
    this.size$,
    this.kind$,
    this.disabled$.pipe(map((isDisabled: boolean) => (isDisabled ? 'disabled' : null))),
  ];

  public readonly loadingSizePx$: Observable<string> = this.size$.pipe(
    map((size: ButtonSize) => (size === 's' ? '12px' : '16px'))
  );

  public readonly resultClassList$: Observable<string[]> = combineLatest([
    ...this.commonButtonClasses,
    this.active$.pipe(map((isActive: boolean) => (isActive ? 'active' : null))),
    this.flexible$.pipe(map((isFlexible: boolean) => (isFlexible ? 'flexible' : null))),
  ]).pipe(
    map((classes: string[]) =>
      classes
        .filter((innerClass: string) => !isNil(innerClass))
        .map((innerProperty: string) => `button_${innerProperty}`)
    )
  );

  public ngOnChanges(changes: ComponentChanges<this>): void {
    this.processSizeChange(changes?.size);
    this.processTypeChange(changes?.type);
    this.processKindChange(changes?.kind);
    this.processDisabledChange(changes?.disabled);
    this.processLeftIconChange(changes?.leftIcon);
    this.processRightIconChange(changes?.rightIcon);
    this.processLoadingChange(changes?.loading);
    this.processActiveChange(changes?.active);
    this.processFlexibleChange(changes?.flexible);
  }

  @HostListener('pointerup', ['$event'])
  public handleTap(event: Event): void {
    this.disabled$.pipe(take(1), filterTruthy()).subscribe(() => {
      event.stopPropagation();
    });
  }

  private processSizeChange(change: ComponentChange<this, ButtonSize>): void {
    const updatedValue: ButtonSize | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.size$.next(updatedValue);
  }

  private processTypeChange(change: ComponentChange<this, ButtonType>): void {
    const updatedValue: ButtonType | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.type$.next(updatedValue);
  }

  private processKindChange(change: ComponentChange<this, ButtonKind>): void {
    const updatedValue: ButtonKind | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.kind$.next(updatedValue);
  }

  private processDisabledChange(change: ComponentChange<this, boolean>): void {
    const updatedValue: boolean | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.disabled$.next(updatedValue);
  }

  private processLeftIconChange(change: ComponentChange<this, string>): void {
    const updatedValue: string | undefined = change?.currentValue;

    if (typeof updatedValue === 'undefined') {
      return;
    }

    this.leftIcon$.next(updatedValue);
  }

  private processRightIconChange(change: ComponentChange<this, string>): void {
    const updatedValue: string | undefined = change?.currentValue;

    if (typeof updatedValue === 'undefined') {
      return;
    }

    this.rightIcon$.next(updatedValue);
  }

  private processLoadingChange(change: ComponentChange<this, boolean>): void {
    const updatedValue: boolean | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.loading$.next(updatedValue);
  }

  private processActiveChange(change: ComponentChange<this, boolean>): void {
    const updatedValue: boolean | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.active$.next(updatedValue);
  }

  private processFlexibleChange(change: ComponentChange<this, boolean>): void {
    const updatedValue: boolean | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.flexible$.next(updatedValue);
    this.hasFlexibleClass = updatedValue;
  }
}
