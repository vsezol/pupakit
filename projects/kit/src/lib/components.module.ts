import { NgModule } from '@angular/core';
import { HammerModule } from '@angular/platform-browser';
import { SharedModule } from '../internal/shared/shared.module';
import { AvatarModule } from './components/avatar/avatar.module';
import { BadgeModule } from './components/badge/badge.module';
import { BreadcrumbsModule } from './components/breadcrumbs/breadcrumbs.module';
import { ButtonGroupModule } from './components/button-group/button-group.module';
import { ButtonModule } from './components/button/button.module';
import { CheckboxModule } from './components/checkbox/checkbox.module';
import { ChipTabsModule } from './components/chip-tabs/chip-tabs.module';
import { ChipModule } from './components/chip/chip.module';
import { ControlTextModule } from './components/control-text/control-text.module';
import { CounterModule } from './components/counter/counter.module';
import { DatagridModule } from './components/datagrid/datagrid.module';
import { DateTimePickerModule } from './components/date-time-picker/date-time-picker.module';
import { DraggableListModule } from './components/draggable-list/draggable-list.module';
import { DraggableModule } from './components/draggable/draggable.module';
import { DrawerOldModule } from './components/drawer-old/drawer-old.module';
import { DrawerModule } from './components/drawer/drawer.module';
import { DropdownMenuModule } from './components/dropdown-menu/dropdown-menu.module';
import { DroppableModule } from './components/droppable/droppable.module';
import { ExpansibleModule } from './components/expansible/expansible.module';
import { FloatingCardModule } from './components/floating-card/floating-card.module';
import { HugeTreeModule } from './components/huge-tree/huge-tree.module';
import { IconButtonModule } from './components/icon-button/icon-button.module';
import { InputModule } from './components/input/input.module';
import { LabelModule } from './components/label/label.module';
import { LayoutModule } from './components/layout/layout.module';
import { LinkModule } from './components/link/link.module';
import { ModalModule } from './components/modal/modal.module';
import { PagedVirtualScrollModule } from './components/paged-virtual-scroll/paged-virtual-scroll.module';
import { ProgressBarModule } from './components/progress-bar/progress-bar.module';
import { RadioGroupModule } from './components/radio-group/radio-group.module';
import { RatingModule } from './components/rating/rating.module';
import { ScrollableModule } from './components/scrollable/scrollable.module';
import { SearchFieldModule } from './components/search-field/search-field.module';
import { SelectModule } from './components/select/select.module';
import { SelectorModule } from './components/selector/selector.module';
import { SkeletonModule } from './components/skeleton/skeleton.module';
import { SpinnerModule } from './components/spinner/spinner.module';
import { StatusModule } from './components/status/status.module';
import { StepperModule } from './components/stepper/stepper.module';
import { SwitcherModule } from './components/switcher/switcher.module';
import { TableModule } from './components/table/table.module';
import { TabsModule } from './components/tabs/tabs.module';
import { TagModule } from './components/tag/tag.module';
import { TextareaModule } from './components/textarea/textarea.module';
import { ThemeWrapperModule } from './components/theme-wrapper/theme-wrapper.module';
import { TimerModule } from './components/timer/timer.module';
import { ToastModule } from './components/toast/toast.module';
import { TooltipModule } from './components/tooltip/tooltip.module';
import { TreeNewModule } from './components/tree-new/tree-new.module';
import { TreeModule } from './components/tree/tree.module';
import { UploadsModule } from './components/uploads/uploads.module';
import { VerticalTabsModule } from './components/vertical-tabs/vertical-tabs.module';

const EXPORTS: any[] = [
  LabelModule,
  ExpansibleModule,
  ButtonModule,
  CheckboxModule,
  ChipModule,
  ChipTabsModule,
  ControlTextModule,
  DatagridModule,
  DateTimePickerModule,
  DraggableModule,
  DrawerModule,
  DrawerOldModule,
  DroppableModule,
  IconButtonModule,
  InputModule,
  LayoutModule,
  ModalModule,
  RadioGroupModule,
  RatingModule,
  SearchFieldModule,
  SelectorModule,
  SpinnerModule,
  SwitcherModule,
  TabsModule,
  TextareaModule,
  ThemeWrapperModule,
  TooltipModule,
  DropdownMenuModule,
  TreeModule,
  TreeNewModule,
  HugeTreeModule,
  VerticalTabsModule,
  SkeletonModule,
  DraggableListModule,
  SelectModule,
  ProgressBarModule,
  UploadsModule,
  CounterModule,
  AvatarModule,
  PagedVirtualScrollModule,
  TableModule,
  FloatingCardModule,
  TagModule,
  ScrollableModule,
  StatusModule,
  BadgeModule,
  BreadcrumbsModule,
  ButtonGroupModule,
  ToastModule,
  LinkModule,
  TimerModule,
  StepperModule,
];

@NgModule({
  imports: [SharedModule, HammerModule, ...EXPORTS],
  exports: [...EXPORTS],
})
export class ComponentsModule {}