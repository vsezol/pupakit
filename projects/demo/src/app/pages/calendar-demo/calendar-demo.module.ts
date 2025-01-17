import { NgModule } from '@angular/core';
import { PupaDirectivesModule } from '@bimeister/pupakit.common';
import { DemoSharedModule } from 'src/app/shared/shared.module';
import { CalendarDemoRoutingModule } from './calendar-demo-routing.module';
import { CalendarDemoComponent } from './calendar-demo.component';
import { Example1Component } from './examples/example-1/example-1.component';
import { Example2Component } from './examples/example-2/example-2.component';
import { Example3Component } from './examples/example-3/example-3.component';

@NgModule({
  declarations: [CalendarDemoComponent, Example1Component, Example2Component, Example3Component],
  imports: [DemoSharedModule, PupaDirectivesModule, CalendarDemoRoutingModule],
})
export class CalendarDemoModule {}
