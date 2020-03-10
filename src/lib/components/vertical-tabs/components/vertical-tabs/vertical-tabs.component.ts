import { ChangeDetectionStrategy, Component, ContentChildren, QueryList, ViewEncapsulation } from '@angular/core';

import { TabsContainer } from '../../../../../internal/declarations/classes/tabs-container.class';
import { VerticalTabsItemComponent } from '../vertical-tabs-item/vertical-tabs-item.component';

@Component({
  selector: 'pupa-vertical-tabs',
  templateUrl: './vertical-tabs.component.html',
  styleUrls: ['./vertical-tabs.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalTabsComponent extends TabsContainer<VerticalTabsItemComponent> {
  @ContentChildren(VerticalTabsItemComponent, {
    descendants: false
  })
  protected readonly tabsList: QueryList<VerticalTabsItemComponent>;
}