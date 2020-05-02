import { ElementRef, HostListener, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { isNullOrUndefined } from '../../helpers/is-null-or-undefined.helper';
import { Position } from '../types/position.type';

export abstract class PositionController {
  public readonly activeControllerRef$: BehaviorSubject<this | null> = new BehaviorSubject<this | null>(null);

  private readonly eventUnListener$: BehaviorSubject<VoidFunction> = new BehaviorSubject<VoidFunction>(null);

  public readonly positionMoveDelta$: BehaviorSubject<Position> = new BehaviorSubject<Position>(null);

  constructor(
    protected readonly renderer: Renderer2,
    protected readonly elementRef: ElementRef<HTMLElement>,
    protected readonly document: Document
  ) {}

  @HostListener('mousedown')
  public processMouseDown(): void {
    this.cancelPreviousListener();
    this.createNewListener();
    this.activeControllerRef$.next(this);
  }

  @HostListener('window:mouseup')
  public processMouseUp(): void {
    this.cancelPreviousListener();
    this.clearCachedPosition();
    this.activeControllerRef$.next(null);
  }

  private cancelPreviousListener(): void {
    this.eventUnListener$
      .pipe(
        take(1),
        filter((unListen: VoidFunction) => !isNullOrUndefined(unListen))
      )
      .subscribe((unListen: VoidFunction) => unListen());
  }

  private clearCachedPosition(): void {
    this.positionMoveDelta$.next(null);
  }

  private createNewListener(): void {
    const unListen: VoidFunction = this.renderer.listen('document', 'mousemove', (event: MouseEvent) => {
      this.updatePosition(event);
    });

    this.eventUnListener$.next(unListen);
  }

  private updatePosition(event: MouseEvent): void {
    const deltaXPx: number = event.movementX;
    const deltaYPx: number = event.movementY;

    this.positionMoveDelta$.next([deltaXPx, deltaYPx]);
  }
}