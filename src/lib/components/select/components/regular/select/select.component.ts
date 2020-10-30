import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { SelectStateService } from '../../../services/select-state.service';
import { SelectBase } from './../../../../../../internal/declarations/classes/abstract/select-base.abstract';

@Component({
  selector: 'pupa-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SelectStateService]
})
export class SelectComponent<T> extends SelectBase<T> {
  @Input() public isMultiSelectionEnabled: boolean = false;
  @Input() public isUnselectionEnabled: boolean = false;

  constructor(
    selectStateService: SelectStateService<T>,
    elementRef: ElementRef<HTMLElement>,
    @Optional() ngControl: NgControl
  ) {
    super(selectStateService, elementRef, ngControl);
  }

  @HostListener('window:resize', ['$event'])
  @HostListener('window:touchstart', ['$event'])
  @HostListener('window:click', ['$event'])
  @HostListener('window:wheel', ['$event'])
  public closeOnOuterEvents(event: Event): void {
    this.processCloseEvent(event);
  }
}