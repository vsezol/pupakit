import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DrawerFloat } from '../../../../internal/declarations/types/drawer-float.type';
import { isNullOrUndefined } from '../../../../internal/helpers/is-null-or-undefined.helper';
import { DrawerDraggerComponent } from '../drawer-dragger/drawer-dragger.component';

@Component({
  selector: 'pupa-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('drawerExpanded', [
      state('false', style({ width: 0 })),
      state('true', style({ width: `*` })),
      transition('false => true', animate('0.32s cubic-bezier(0.97, 0.84, .03, 0.95)')),
      transition('true => false', animate('0.2s ease-in-out'))
    ])
  ]
})
export class DrawerComponent implements OnChanges, AfterContentInit, OnDestroy {
  private draggerMoveSubscription: Subscription = new Subscription();

  public readonly modifiedContentWidthPx$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  private shouldShowOverlay: boolean = false;
  private shouldRenderContent: boolean = false;
  private shouldHideContent: boolean = true;

  @ContentChild(DrawerDraggerComponent, { static: false }) private readonly draggerComponent: DrawerDraggerComponent;
  @ViewChild('drawerContentElement', { static: false }) private readonly drawerContentRef: ElementRef<HTMLDivElement>;

  /**
   * @description content wrapper CSS styles property
   * @example contentWidth = '300px'
   */
  @Input() public contentWidth: string = 'fit-content';
  @Input() public maxContentWidth: string = '80vw';
  @Input() public minContentWidth: string = '0';
  @Input() public float: DrawerFloat = 'right';
  @Input() public withPadding: boolean = true;
  @Input() public isVisible: boolean = false;
  @Input() public destroyContentOnClose: boolean = true;
  @Input() public withOverlay: boolean = false;
  @Input() public closeByEsc: boolean = true;
  @Input() public closeByOverlayClick: boolean = true;

  @Output() public readonly close: EventEmitter<void> = new EventEmitter<void>();

  public get isContentRendered(): boolean {
    return this.destroyContentOnClose ? this.shouldRenderContent : true;
  }

  public get isContentVisible(): boolean {
    return !this.shouldHideContent;
  }

  public get isOverlayVisible(): boolean {
    return this.withOverlay ? this.shouldShowOverlay : false;
  }

  @HostListener('window:keydown', ['$event'])
  public processKeyPressEvent(event: KeyboardEvent): void {
    if (!this.closeByEsc || isNullOrUndefined(event) || isNullOrUndefined(event.key)) {
      return;
    }
    const isEscPressed: boolean = event.key.toLowerCase() === 'escape';
    if (!isEscPressed) {
      return;
    }
    this.closeDrawer();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.processIsVisibleValueChange(changes.isVisible);
    this.processwithOverlayValueChange(changes.withOverlay);
  }

  public ngAfterContentInit(): void {
    this.draggerMoveSubscription.unsubscribe();
    this.draggerMoveSubscription = this.subscribeOnDraggerMoveIfDraggerIsDefined();
  }

  public ngOnDestroy(): void {
    if (this.draggerMoveSubscription.closed) {
      return;
    }
    this.draggerMoveSubscription.unsubscribe();
  }

  public processAnimationEnd(event: AnimationEvent): void {
    const isCollapseAnimationDone: boolean = String(event.toState) === 'false';
    if (!isCollapseAnimationDone) {
      return;
    }
    this.shouldRenderContent = false;
    this.shouldHideContent = true;
  }

  public getContentAreaWidth(modifiedWidthPx: number): string {
    if (isNullOrUndefined(modifiedWidthPx)) {
      return this.contentWidth;
    }
    return `${modifiedWidthPx}px`;
  }

  public processOverlayClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.closeByOverlayClick) {
      return;
    }
    this.closeDrawer();
  }

  private processIsVisibleValueChange(change: SimpleChange): void {
    if (isNullOrUndefined(change) || change.currentValue === change.previousValue) {
      return;
    }
    const drawerBecameVisible: boolean = change.currentValue === true;
    drawerBecameVisible ? this.openDrawer() : this.closeDrawer();
  }

  private processwithOverlayValueChange(change: SimpleChange): void {
    if (isNullOrUndefined(change) || !this.isVisible) {
      return;
    }
    const overlayIsVisible: boolean = change.currentValue === true;
    overlayIsVisible ? this.showOverlay() : this.hideOverlay();
  }

  private openDrawer(): void {
    this.shouldRenderContent = true;
    this.shouldHideContent = false;
    if (this.withOverlay) {
      this.showOverlay();
    }
  }

  private closeDrawer(): void {
    this.hideOverlay();
    this.close.emit();
  }

  private showOverlay(): void {
    this.shouldShowOverlay = true;
  }

  private hideOverlay(): void {
    this.shouldShowOverlay = false;
  }

  private subscribeOnDraggerMoveIfDraggerIsDefined(): Subscription {
    if (isNullOrUndefined(this.draggerComponent)) {
      return new Subscription();
    }

    return this.draggerComponent.mouseOffsetFromElementPx$
      .pipe(
        takeUntil(this.draggerComponent.destroy$),
        filter(
          () => !isNullOrUndefined(this.drawerContentRef) && !isNullOrUndefined(this.drawerContentRef.nativeElement)
        )
      )
      .subscribe((horizontalMouseOffsetFromElementPx: number) => {
        const currentWidthPx: number = this.drawerContentRef.nativeElement.getBoundingClientRect().width;
        const modifiedWidthPx: number =
          this.float === 'right'
            ? currentWidthPx - horizontalMouseOffsetFromElementPx
            : currentWidthPx + horizontalMouseOffsetFromElementPx;
        this.modifiedContentWidthPx$.next(modifiedWidthPx);
      });
  }
}