import { Directive, ElementRef, Inject } from '@angular/core';

@Directive({
  selector: '[pupaResizable]',
})
export class PupaResizableDirective<T extends Element = HTMLElement> extends ElementRef<T> {
  public readonly nativeElement: T;

  constructor(@Inject(ElementRef) elementRef: ElementRef<T>) {
    super(elementRef.nativeElement);
  }
}
