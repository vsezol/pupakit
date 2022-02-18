import { OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { ModalContainerComponent } from '../../../lib/components/modal/components/modal-container/modal-container.component';
import { ModalConfig } from '../interfaces/modal-config.interface';
import { ConnectedPositionX } from '../types/connected-position-x.type';
import { ConnectedPositionY } from '../types/connected-position-y.type';
import { Position } from '../types/position.type';

export class ModalRef<ReturnDataT = null> {
  public readonly closed$: Subject<ReturnDataT> = new Subject<ReturnDataT>();
  public readonly opened$: Subject<void> = new Subject<void>();
  public readonly positionUpdated$: Subject<Position> = new Subject<Position>();
  public readonly toTopLayerMoved$: Subject<void> = new Subject();

  constructor(
    public readonly modalId: string,
    private readonly overlayRef: OverlayRef,
    private readonly config: ModalConfig
  ) {}

  public moveToTopLayer(): void {
    this.toTopLayerMoved$.next();
  }

  public getOverlayHtmlElement(): HTMLElement {
    return this.overlayRef.overlayElement;
  }

  public getOverlayXPosition(): ConnectedPositionX {
    return this.config.overlayX;
  }

  public getOverlayYPosition(): ConnectedPositionY {
    return this.config.overlayY;
  }

  public updatePosition(newPosition: Position): void {
    this.positionUpdated$.next(newPosition);
  }

  public open(componentPortal: ComponentPortal<ModalContainerComponent<unknown>>): void {
    this.overlayRef.attach(componentPortal);
    this.opened$.next();
    this.opened$.complete();
  }

  public close(data: ReturnDataT = null): void {
    this.overlayRef.dispose();
    this.closed$.next(data);

    this.closed$.complete();
    this.positionUpdated$.complete();
    this.toTopLayerMoved$.complete();
  }
}