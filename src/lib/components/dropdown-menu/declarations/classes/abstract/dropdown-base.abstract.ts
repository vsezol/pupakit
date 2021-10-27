import { asyncScheduler, BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, observeOn, take, takeWhile, withLatestFrom } from 'rxjs/operators';
import { filterNotNil, isNil, Nullable } from '@bimeister/utilities';
import { ElementRef, TemplateRef } from '@angular/core';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

export abstract class DropdownBase<ContainerComponent extends unknown> {
  private readonly isOpenState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isOpen$: Observable<boolean> = this.isOpenState$.pipe(distinctUntilChanged());

  private readonly contentTemplateState$: BehaviorSubject<Nullable<TemplateRef<unknown>>> = new BehaviorSubject<
    Nullable<TemplateRef<unknown>>
  >(null);
  public readonly contentTemplate$: Observable<Nullable<TemplateRef<unknown>>> = this.contentTemplateState$.pipe(
    distinctUntilChanged()
  );

  private readonly overlayRef$: BehaviorSubject<Nullable<OverlayRef>> = new BehaviorSubject<Nullable<OverlayRef>>(null);

  protected readonly triggerRef$: BehaviorSubject<Nullable<ElementRef<HTMLElement>>> = new BehaviorSubject<
    Nullable<ElementRef<HTMLElement>>
  >(null);

  protected constructor(protected readonly overlay: Overlay) {}

  protected abstract getPositionStrategy(): Observable<FlexibleConnectedPositionStrategy>;

  protected abstract getComponentPortal(): ComponentPortal<ContainerComponent>;

  public setIsOpen(isOpen: boolean): void {
    this.isOpenState$
      .pipe(
        take(1),
        filter((currentOpenState: boolean) => currentOpenState !== isOpen)
      )
      .subscribe(() => (isOpen ? this.open() : this.close()));
  }

  public setContentTemplate(template: TemplateRef<unknown>): void {
    this.contentTemplateState$.next(template);
  }

  public setTriggerRef(triggerRef: ElementRef<HTMLElement>): void {
    this.triggerRef$.next(triggerRef);
  }

  private open(): void {
    this.createOverlay();
    this.overlayRef$
      .pipe(
        takeWhile((overlayRef: OverlayRef) => !isNil(overlayRef)),
        take(1)
      )
      .subscribe((overlayRef: OverlayRef) => {
        overlayRef.attach(this.getComponentPortal());
        overlayRef.updatePosition();
        this.closeOnClickOutside(overlayRef);
        this.isOpenState$.next(true);
      });
  }

  private close(): void {
    this.overlayRef$
      .pipe(
        takeWhile((overlayRef: OverlayRef) => !isNil(overlayRef)),
        take(1)
      )
      .subscribe((overlayRef: OverlayRef) => {
        this.isOpenState$.next(false);
        overlayRef.dispose();
        overlayRef.detach();
        this.overlayRef$.next(null);
      });
  }

  private closeOnClickOutside(overlayRef: OverlayRef): void {
    overlayRef
      .outsidePointerEvents()
      .pipe(
        take(1),
        observeOn(asyncScheduler),
        withLatestFrom(this.isOpenState$),
        filter(([, isOpen]: [MouseEvent, boolean]) => isOpen)
      )
      .subscribe(() => {
        this.close();
      });
  }

  private createOverlay(): void {
    this.getPositionStrategy()
      .pipe(take(1), filterNotNil())
      .subscribe((positionStrategy: FlexibleConnectedPositionStrategy) => {
        const overlayConfig: OverlayConfig = new OverlayConfig({
          positionStrategy
        });
        const overlayRef: OverlayRef = this.overlay.create(overlayConfig);
        this.overlayRef$.next(overlayRef);
      });
  }
}