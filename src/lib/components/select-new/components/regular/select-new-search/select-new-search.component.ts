import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';

import { SelectSearchBase } from './../../../../../../internal/declarations/classes/abstract/select-search-base.abstract';

@Component({
  selector: 'pupa-select-new-search',
  templateUrl: './select-new-search.component.html',
  styleUrls: ['./select-new-search.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectNewSearchComponent extends SelectSearchBase {
  @Input() public placeholder: string = '';
  @Output() public readonly query: EventEmitter<string> = new EventEmitter<string>();

  @HostListener('click', ['$event'])
  public processClick(event: Event): void {
    this.processDomEvent(event);
  }
}