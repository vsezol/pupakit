import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { isNil } from '@meistersoft/utilities';
import { InputBase } from '../../../../../internal/declarations/classes/abstract/input-base.abstract';
import { ValueType } from '../../../../../internal/declarations/types/input-value.type';

@Component({
  selector: 'pupa-input-password',
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPasswordComponent extends InputBase<ValueType> {
  public setValue(value: ValueType): void {
    const serializedValue: string = isNil(value) ? '' : String(value);
    this.value$.next(serializedValue);
  }
}