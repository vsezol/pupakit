import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { SelectNewStateService } from '../../../services/select-new-state.service';
import { SelectItemBase } from './../../../../../../internal/declarations/classes/abstract/select-item-base.abstract';

@Component({
  selector: 'pupa-select-new-item',
  templateUrl: './select-new-item.component.html',
  styleUrls: ['./select-new-item.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectNewItemComponent<T> extends SelectItemBase<T> {
  @Input() public value: T = null;

  constructor(selectNewStateService: SelectNewStateService<T>) {
    super(selectNewStateService);
  }
}