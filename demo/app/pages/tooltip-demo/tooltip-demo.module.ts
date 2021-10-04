import { NgModule, Type } from '@angular/core';
import { DemoSharedModule } from '../../shared/shared.module';
import { TooltipExample1Component } from './examples/example-1/example-1.component';
import { TooltipExample2Component } from './examples/example-2/example-2.component';
import { TooltipExample3Component } from './examples/example-3/example-3.component';
import { TooltipDemoRoutingModule } from './tooltip-demo-routing.module';
import { TooltipDemoComponent } from './tooltip-demo.component';

const EXAMPLES: Type<unknown>[] = [TooltipExample1Component, TooltipExample2Component, TooltipExample3Component];
const COMPONENTS: Type<unknown>[] = [TooltipDemoComponent, ...EXAMPLES];

const DECLARATIONS: Type<unknown>[] = [...COMPONENTS];

@NgModule({
  declarations: [...DECLARATIONS],
  imports: [DemoSharedModule, TooltipDemoRoutingModule]
})
export class TooltipDemoModule {}
