import { ColorsComponent } from './colors/colors.component';
import { SpinnerDemoComponent } from './spinner-demo/spinner-demo.component';
import { ChipSelectTreeDemoComponent } from './chip-select-tree-demo/chip-select-tree-demo.component';
import { LoaderDemoComponent } from './loader-demo/loader-demo.component';
import { ButtonDemoComponent } from './button-demo/button-demo.component';
import { ChipDemoComponent } from './chip-demo/chip-demo.component';
import { ChipButtonDemoComponent } from './chip-button-demo/chip-button-demo.component';
import { ChipSelectDemoComponent } from './chip-select-demo/chip-select-demo.component';
import { ChipTabsDemoComponent } from './chip-tabs-demo/chip-tabs-demo.component';
import { IconButtonDemoComponent } from './icon-button-demo/icon-button-demo.component';
import { CheckboxDemoComponent } from './checkbox-demo/checkbox-demo.component';
import { InputDemoComponent } from './input-demo/input-demo.component';
import { TableInputDemoComponent } from './table-input-demo/table-input-demo.component';
import { SearchFieldDemoComponent } from './search-field-demo/search-field-demo.component';
import { DropdownDemoComponent } from './dropdown-demo/dropdown-demo.component';
import { TileDemoComponent } from './tile-demo/tile-demo.component';
import { TimeInputDemoComponent } from './time-input-demo/time-input-demo.component';
import { TreeDemoComponent } from './tree-demo/tree-demo.component';
import { SelectDemoComponent } from './select-demo/select-demo.component';
import { SelectMultipleDemoComponent } from './select-multiple-demo/select-multiple-demo.component';
import { SwitcherDemoComponent } from './switcher-demo/switcher-demo.component';
import { DroppableDemoComponent } from './droppable-demo/droppable-demo.component';
import { RatingDemoComponent } from './rating-demo/rating-demo.component';
import { DaySelectorDemoComponent } from './day-selector-demo/day-selector-demo.component';
import { DraggableDemoComponent } from './draggable-demo/draggable-demo.component';
import { DateTimePickerDemoComponent } from './date-time-picker-demo/date-time-picker-demo.component';
import { ScrollbarDemoComponent } from './scrollbar-demo/scrollbar-demo.component';
import { ModalDemoComponent } from './modal-demo/modal-demo.component';
import { TabsDemoComponent } from './tabs-demo/tabs-demo.component';
import { DatagridDemoComponent } from './datagrid-demo/datagrid-demo.component';
import { DrawerDemoComponent } from './drawer-demo/drawer-demo.component';
import { TextareaDemoComponent } from './textarea-demo/textarea-demo.component';
import { TabsDrawerDemoComponent } from './tabs-drawer-demo/tabs-drawer-demo.component';
import { RadioButtonDemoComponent } from './radio-button-demo/radio-button-demo.component';
import { LayoutDemoComponent } from './layout-demo/layout-demo.component';
import { MultiselectionListDemoComponent } from './multiselection-list-demo/multiselection-list-demo.component';
import { TooltipDemoComponent } from './tooltip-demo/tooltip-demo.component';
import { DraggableListDemoComponent } from './draggable-list-demo/draggable-demo.component';
import { DropdownMenuDemoComponent } from './dropdown-menu-demo/dropdown-menu-demo.component';
import { SelectorDemoComponent } from './selector-demo/selector-demo.component';
import { UploadsDemoComponent } from './uploads-demo/uploads-demo.component';
import { Routes } from '@angular/router';
import { TypographyPageComponent } from './typography-page/typography-page.component';
import { IconPageComponent } from './icon-page/icon-page.component';

export const demoRoutes: Routes = [
  {
    path: 'typography',
    component: TypographyPageComponent
  },
  {
    path: 'colors',
    component: ColorsComponent
  },
  {
    path: 'icon',
    component: IconPageComponent
  },
  {
    path: 'spinner',
    component: SpinnerDemoComponent
  },
  {
    path: 'chip-select-tree',
    component: ChipSelectTreeDemoComponent
  },
  {
    path: 'loader',
    component: LoaderDemoComponent
  },
  {
    path: 'button',
    component: ButtonDemoComponent
  },
  {
    path: 'chip',
    component: ChipDemoComponent
  },
  {
    path: 'chip-button',
    component: ChipButtonDemoComponent
  },
  {
    path: 'chip-select',
    component: ChipSelectDemoComponent
  },
  {
    path: 'chip-tabs',
    component: ChipTabsDemoComponent
  },
  {
    path: 'icon-button',
    component: IconButtonDemoComponent
  },
  {
    path: 'checkbox',
    component: CheckboxDemoComponent
  },
  {
    path: 'input',
    component: InputDemoComponent
  },
  {
    path: 'table-input',
    component: TableInputDemoComponent
  },
  {
    path: 'search-field',
    component: SearchFieldDemoComponent
  },
  {
    path: 'dropdown',
    component: DropdownDemoComponent
  },
  {
    path: 'tile',
    component: TileDemoComponent
  },
  {
    path: 'time-input',
    component: TimeInputDemoComponent
  },
  {
    path: 'tree',
    component: TreeDemoComponent
  },
  {
    path: 'select',
    component: SelectDemoComponent
  },
  {
    path: 'select-multiple',
    component: SelectMultipleDemoComponent
  },
  {
    path: 'switcher',
    component: SwitcherDemoComponent
  },
  {
    path: 'droppable',
    component: DroppableDemoComponent
  },
  {
    path: 'rating',
    component: RatingDemoComponent
  },
  {
    path: 'day-selector',
    component: DaySelectorDemoComponent
  },
  {
    path: 'draggable',
    component: DraggableDemoComponent
  },
  {
    path: 'date-time-picker',
    component: DateTimePickerDemoComponent
  },
  { path: 'scrollbar', component: ScrollbarDemoComponent },
  { path: 'modal', component: ModalDemoComponent },
  { path: 'tabs', component: TabsDemoComponent },
  { path: 'datagrid', component: DatagridDemoComponent },
  { path: 'drawer', component: DrawerDemoComponent },
  { path: 'textarea', component: TextareaDemoComponent },
  { path: 'tabs-drawer', component: TabsDrawerDemoComponent },
  { path: 'radio', component: RadioButtonDemoComponent },
  { path: 'layout', component: LayoutDemoComponent },
  { path: 'multiselection-list', component: MultiselectionListDemoComponent },
  { path: 'tooltip', component: TooltipDemoComponent },
  { path: 'draggable-list', component: DraggableListDemoComponent },
  { path: 'dropdown-menu', component: DropdownMenuDemoComponent },
  { path: 'selector', component: SelectorDemoComponent },
  {
    path: 'uploads',
    component: UploadsDemoComponent
  },
  {
    path: '',
    redirectTo: '/typography',
    pathMatch: 'full'
  }
];