import { Component, ElementRef, HostListener, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { TooltipService } from '../../../layout/services/tooltip.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'pupa-tooltip',
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent {
  @Input() public closeOnContentClick: boolean = true;

  public triggerRef: ElementRef<HTMLElement>;
  public contentRef: TemplateRef<HTMLElement>;

  public readonly isActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly subscription: Subscription = new Subscription();

  constructor(private readonly tooltipService: TooltipService) {
    this.subscription.add(this.listenOpenCloseTooltipState());
  }

  public open(): void {
    this.tooltipService.open({
      triggerRef: this.triggerRef,
      templateRef: this.contentRef,
      closeOnContentClick: this.closeOnContentClick
    });
  }

  @HostListener('click')
  @HostListener('mouseenter')
  public clickOpen(): void {
    this.open();
    this.isActive$.next(true);
  }

  private listenOpenCloseTooltipState(): Subscription {
    return this.tooltipService.isOpened$.pipe(filter((isOpened: boolean) => !isOpened)).subscribe(() => {
      this.isActive$.next(false);
    });
  }
}