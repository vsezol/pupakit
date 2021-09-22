import { NgModule, Type } from '@angular/core';
import { TableDemoComponent } from './table-demo.component';
import { DemoSharedModule } from '../../shared/shared.module';
import { TableDemoRoutingModule } from './table-demo-routing.module';
import { TableExample1Component } from './examples/example-1/example-1.component';
import { TableExample2Component } from './examples/example-2/example-2.component';
import { TableExample3Component } from './examples/example-3/example-3.component';
import { TableExample4Component } from './examples/example-4/example-4.component';
import { TableExample5Component } from './examples/example-5/example-5.component';
import { TableExample6Component } from './examples/example-6/example-6.component';
import { TableExample7Component } from './examples/example-7/example-7.component';

const EXAMPLE_COMPONENTS: Type<unknown>[] = [
  TableExample1Component,
  TableExample2Component,
  TableExample3Component,
  TableExample4Component,
  TableExample5Component,
  TableExample6Component,
  TableExample7Component
];

@NgModule({
  declarations: [...EXAMPLE_COMPONENTS, TableDemoComponent],
  imports: [TableDemoRoutingModule, DemoSharedModule]
})
export class TableDemoModule {}