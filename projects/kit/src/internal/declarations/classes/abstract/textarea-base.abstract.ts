import { Directive, ElementRef, EventEmitter, Input, OnChanges, Optional, Output, ViewChild } from '@angular/core';
import { NgControl } from '@angular/forms';
import { distinctUntilSerializedChanged, filterNotNil, isNil, Nullable } from '@bimeister/utilities';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentChange } from '../../interfaces/component-change.interface';
import { ComponentChanges } from '../../interfaces/component-changes.interface';
import { InputBaseControlValueAccessor } from './input-base-control-value-accessor.abstract';
import { ThemeWrapperService } from '../../../../lib/components/theme-wrapper/services/theme-wrapper.service';

const DEFAULT_MAX_ROWS: number = 5;
const TEXTAREA_VERTICAL_PADDINGS_PX: number = 16;

@Directive()
export abstract class TextareaBase extends InputBaseControlValueAccessor<string> implements OnChanges {
  @ViewChild('lineHeightSource', { static: true })
  protected readonly lineHeightSourceRef: ElementRef<HTMLTextAreaElement>;

  @ViewChild('textarea')
  protected readonly textareaElementRef: ElementRef<HTMLTextAreaElement>;

  @Input() public readonly placeholder: string = '';
  public readonly placeholder$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  @Input() public readonly autocomplete: boolean = false;
  public readonly autocomplete$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() public readonly isPatched: boolean = false;
  public readonly isPatched$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() public minRows: number = 2;
  private readonly minRows$: BehaviorSubject<number> = new BehaviorSubject<number>(this.minRows);
  public readonly minHeightPx$: Observable<number> = this.minRows$.pipe(
    map((minRows: number) => this.getHeightPxByRowsCount(minRows) + TEXTAREA_VERTICAL_PADDINGS_PX)
  );

  @Input() public maxRows: number = DEFAULT_MAX_ROWS;
  private readonly maxRows$: BehaviorSubject<Nullable<number>> = new BehaviorSubject<Nullable<number>>(this.maxRows);
  public readonly maxHeightPx$: Observable<Nullable<number>> = combineLatest([this.minRows$, this.maxRows$]).pipe(
    map(([minRows, maxRows]: [number, Nullable<number>]) => {
      if (isNil(maxRows)) {
        return null;
      }

      if (maxRows < minRows) {
        return minRows;
      }

      return maxRows;
    }),
    map((rowCount: number) => this.getHeightPxByRowsCount(rowCount) + TEXTAREA_VERTICAL_PADDINGS_PX)
  );

  @Input() public maxLength: Nullable<number> = null;
  public readonly maxLength$: BehaviorSubject<Nullable<number>> = new BehaviorSubject<Nullable<number>>(null);

  @Output() private readonly focus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output() private readonly blur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  public readonly isInvalid$: Observable<boolean> = combineLatest([
    this.isDisabled$,
    this.isPatched$,
    this.isValid$,
    this.isTouched$,
  ]).pipe(
    distinctUntilSerializedChanged(),
    map(
      ([isDisabled, isPatched, isValid, isTouched]: [boolean, boolean, boolean, boolean]) =>
        (isTouched || isPatched) && !isValid && !isDisabled
    )
  );

  public readonly themeClass$: Observable<string> = this.themeWrapperService?.themeClass$ ?? of('');

  private readonly valueLength$: Observable<number> = this.value$.pipe(
    filterNotNil(),
    map((currentValue: string) => currentValue?.length ?? 0)
  );

  public readonly counterValue$: Observable<string> = combineLatest([this.maxLength$, this.valueLength$]).pipe(
    map(([maxLength, valueLength]: [number, number]) => `${valueLength}/${maxLength}`)
  );

  constructor(
    @Optional() ngControl: NgControl,
    @Optional() protected readonly themeWrapperService: ThemeWrapperService
  ) {
    super(ngControl);
  }

  protected setValue(value: Nullable<string>): void {
    const serializedValue: string = isNil(value) ? '' : value;
    this.value$.next(serializedValue);
  }

  public ngOnChanges(changes: ComponentChanges<this>): void {
    this.processPlaceholderChange(changes?.placeholder);
    this.processAutocompleteChange(changes?.autocomplete);
    this.processIsPatchedChange(changes?.isPatched);

    this.processMaxLengthChange(changes?.maxLength);
    this.processMaxRowsChange(changes?.maxRows);
    this.processMinRowsChange(changes?.minRows);
  }

  public emitFocusEvent(focusEvent: FocusEvent): void {
    this.isFocused$.next(true);
    this.focus.emit(focusEvent);
  }

  public emitBlurEvent(blurEvent: FocusEvent): void {
    this.isFocused$.next(false);
    this.blur.emit(blurEvent);
  }

  public focusOnTextareaElement(): void {
    const textareaElement: HTMLTextAreaElement = this.textareaElementRef.nativeElement;
    textareaElement.focus();
  }

  public processMouseDown(event: MouseEvent): void {
    if (event.target === this.textareaElementRef.nativeElement) {
      return;
    }
    event.preventDefault();
  }

  private processPlaceholderChange(change: ComponentChange<this, string>): void {
    const updatedValue: string | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.placeholder$.next(updatedValue);
  }

  private processAutocompleteChange(change: ComponentChange<this, boolean>): void {
    const updatedValue: boolean | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.autocomplete$.next(updatedValue);
  }

  private processIsPatchedChange(change: ComponentChange<this, boolean>): void {
    const updatedValue: boolean | undefined = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }

    this.isPatched$.next(updatedValue);
  }

  private processMaxLengthChange(change: ComponentChange<this, Nullable<number>>): void {
    const updatedValue: Nullable<number> = change?.currentValue;

    if (isNil(updatedValue)) {
      return;
    }
    this.maxLength$.next(updatedValue);
  }

  private processMaxRowsChange(change: ComponentChange<this, Nullable<number>>): void {
    const updatedValue: Nullable<number> = change?.currentValue;

    if (isNil(updatedValue) || !Number.isInteger(updatedValue)) {
      return;
    }

    this.maxRows$.next(updatedValue);
  }

  private processMinRowsChange(change: ComponentChange<this, Nullable<number>>): void {
    const updatedValue: Nullable<number> = change?.currentValue;

    if (isNil(updatedValue) || !Number.isInteger(updatedValue)) {
      return;
    }

    this.minRows$.next(updatedValue);
  }

  private getHeightPxByRowsCount(rowsCount: number): number {
    const computedStyles: CSSStyleDeclaration = getComputedStyle(this.lineHeightSourceRef.nativeElement);
    const lineHeightPx: number = Number.parseFloat(computedStyles.lineHeight);
    return lineHeightPx * rowsCount;
  }
}