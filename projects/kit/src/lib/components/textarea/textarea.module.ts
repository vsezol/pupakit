import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../internal/shared/shared.module';
import { ButtonsModule } from '../buttons/buttons.module';
import { ScrollableModule } from '../scrollable/scrollable.module';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { TextareaInlineComponent } from './components/textarea-inline/textarea-inline.component';
import { TextareaComponent } from './components/textarea/textarea.component';

@NgModule({
  declarations: [TextareaComponent, TextareaInlineComponent],
  imports: [SharedModule, ScrollableModule, ButtonsModule, ThemeWrapperModule, OverlayModule, PortalModule],
  exports: [TextareaComponent, TextareaInlineComponent],
})
export class TextareaModule {}
