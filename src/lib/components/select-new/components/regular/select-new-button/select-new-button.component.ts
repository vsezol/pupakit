import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';

import { SelectNewStateService } from '../../../services/select-new-state.service';
import { SelectButtonBase } from './../../../../../../internal/declarations/classes/abstract/select-button-base.abstract';

@Component({
  selector: 'pupa-select-new-button',
  templateUrl: './select-new-button.component.html',
  styleUrls: ['./select-new-button.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectNewButtonComponent<T> extends SelectButtonBase<T> {
  @ViewChild('overlayOrigin', { static: true }) protected readonly overlayOrigin: CdkOverlayOrigin;
  @ViewChild('button', { static: true }) protected readonly button: ElementRef<HTMLButtonElement>;

  @Input() public transparent: boolean = false;

  constructor(selectNewStateService: SelectNewStateService<T>) {
    super(selectNewStateService);
  }
}