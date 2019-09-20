import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalSize = 'large' | 'medium' | 'small';

export enum ElementState {
  Appeared = 'Appeared',
  Dissapeared = 'Dissapeared',
  Void = 'Void'
}

@Component({
  selector: 'pupa-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('overlayAppeared', [
      state(
        ElementState.Void,
        style({
          opacity: '0'
        })
      ),
      state(
        ElementState.Dissapeared,
        style({
          opacity: '0'
        })
      ),
      state(
        ElementState.Appeared,
        style({
          opacity: '1'
        })
      ),
      transition('* => *', animate('0.32s cubic-bezier(0.2, 1, 1, 1)'))
    ])
  ]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() public clickableOverlay: boolean = true;
  @Input() public closeButton: boolean = true;
  @Input() public size: ModalSize = 'medium';
  @Input() public title: string = null;

  @Output() public readonly closed: EventEmitter<void> = new EventEmitter<void>();

  public readonly overlayAnimationState$: BehaviorSubject<ElementState> = new BehaviorSubject<ElementState>(
    ElementState.Appeared
  );

  constructor(private readonly renderer: Renderer2) {}

  @HostListener('window:keydown', ['$event'])
  public processWindowKeypress(event: KeyboardEvent): void {
    const isEscPressed: boolean = event.key.toLowerCase() === 'escape';
    if (isEscPressed) {
      this.closed.emit();
    }
  }

  public ngOnInit(): void {
    this.disableScrolling();
  }

  public ngOnDestroy(): void {
    this.enableScrolling();
  }

  public processOverlayClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.clickableOverlay) {
      return;
    }
    this.closed.emit();
  }

  public processCloseButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    this.closed.emit();
  }

  private disableScrolling(): void {
    this.renderer.setStyle(globalThis.document.body, 'overflow', 'hidden');
  }

  private enableScrolling(): void {
    this.renderer.removeStyle(globalThis.document.body, 'overflow');
  }
}