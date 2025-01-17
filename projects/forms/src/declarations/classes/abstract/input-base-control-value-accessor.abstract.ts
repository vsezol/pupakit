import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlStatus, NgControl } from '@angular/forms';
import { Nullable, filterNotNil, isEmpty, isNil, shareReplayWithRefCount } from '@bimeister/utilities';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { delay, distinctUntilChanged, map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { isFormControlValidStatus } from '../../functions/is-form-control-valid-status.function';
import { OnChangeCallback } from '../../types/on-change-callback.type';
import { OnTouchedCallback } from '../../types/on-touched-callback.type';

@Directive()
export abstract class InputBaseControlValueAccessor<T> implements ControlValueAccessor, OnDestroy, OnInit {
  @Input() protected readonly formControl: FormControl;

  protected readonly control$: BehaviorSubject<Nullable<NgControl>> = new BehaviorSubject(null);
  public readonly value$: BehaviorSubject<T> = new BehaviorSubject(null);
  public readonly isFilled$: Observable<boolean> = this.value$.pipe(map((value: T) => !isEmpty(value)));
  public readonly isDisabled$: BehaviorSubject<Nullable<boolean>> = new BehaviorSubject<boolean>(null);
  public readonly isTouched$: BehaviorSubject<Nullable<boolean>> = new BehaviorSubject<boolean>(null);
  public readonly isFocused$: BehaviorSubject<Nullable<boolean>> = new BehaviorSubject<boolean>(null);
  public readonly isValid$: Observable<boolean> = this.control$.pipe(
    switchMap((control: NgControl) =>
      isNil(control)
        ? of(true)
        : control.statusChanges.pipe(
            startWith(control.status),
            map((status: FormControlStatus) => isFormControlValidStatus(status))
          )
    ),
    distinctUntilChanged(),
    shareReplayWithRefCount()
  );

  private readonly onChangeCallback$: BehaviorSubject<OnChangeCallback<T>> = new BehaviorSubject<OnChangeCallback<T>>(
    null
  );
  private readonly onTouchedCallback$: BehaviorSubject<OnTouchedCallback> = new BehaviorSubject<OnTouchedCallback>(
    null
  );

  protected readonly subscription: Subscription = new Subscription();

  constructor(@Optional() protected readonly ngControl: NgControl) {
    if (isNil(ngControl)) {
      return;
    }
    ngControl.valueAccessor = this;

    this.setControlRef(this.ngControl);
  }

  protected abstract setValue(value: T): void;

  protected handleChangedValue(onChangeCallback: OnChangeCallback<any>, value: T): void {
    onChangeCallback(value);
    this.setValue(value);
  }

  protected setControlRef(control: Nullable<NgControl>): void {
    this.control$.next(control);
  }

  public ngOnInit(): void {
    this.subscription.add(this.processNgControlStatusChangesForHandleIsTouched());
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public updateValue(updatedValue: T): void {
    this.isTouched$.next(true);

    combineLatest([this.onChangeCallback$, this.onTouchedCallback$])
      .pipe(take(1))
      .subscribe(([onChangeCallback, onTouchedCallback]: [OnChangeCallback<T>, OnTouchedCallback]) => {
        if (typeof onTouchedCallback === 'function') {
          onTouchedCallback();
        }

        if (typeof onChangeCallback === 'function') {
          this.handleChangedValue(onChangeCallback, updatedValue);
        }
      });
  }

  public writeValue(newValue: T): void {
    this.setValue(newValue);
  }

  public registerOnChange(onChange: OnChangeCallback<T>): void {
    this.onChangeCallback$.next(onChange);
  }

  public registerOnTouched(onTouched: OnTouchedCallback): void {
    this.onTouchedCallback$.next(onTouched);
  }

  public setDisabledState(isDisabled: boolean): void {
    this.processSetDisabledState(isDisabled);
  }

  private processSetDisabledState(isDisabled: boolean): void {
    const nextDisabledValue: Nullable<boolean> = isDisabled ? true : null;
    this.isDisabled$.next(nextDisabledValue);
  }

  private processNgControlStatusChangesForHandleIsTouched(): Subscription {
    return this.control$
      .pipe(
        filterNotNil(),
        switchMap((control: NgControl) =>
          control.statusChanges.pipe(
            delay(0),
            startWith(this.ngControl.touched),
            map(() => this.ngControl.touched),
            tap((isTouched: boolean) => this.isTouched$.next(isTouched))
          )
        )
      )
      .subscribe();
  }
}
