import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { OpenedModal } from '@kit/internal/declarations/interfaces/opened-modal.interface';
import { Position } from '@kit/internal/declarations/types/position.type';
import { ModalsService } from '@kit/internal/shared/services/modals.service';
import { MODAL_DATA_TOKEN } from '../../../declarations/tokens/modal-data.token';
import { ModalDemoContentComponent } from './modal-demo-content/modal-demo-content.component';
import { ModalDemoLocalService } from './services/modal-demo-local.service';

const BASE_REQUEST_PATH: string = 'modal-demo/examples';

@Component({
  selector: 'demo-modal-demo',
  templateUrl: './modal-demo.component.html',
  styleUrls: ['./modal-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [ModalDemoLocalService],
})
export class ModalDemoComponent {
  public readonly example1Content: Record<string, string> = {
    HTML: `${BASE_REQUEST_PATH}/modal-demo-example-1/modal-content/modal-demo-example-1.component.html`,
    SCSS: `${BASE_REQUEST_PATH}/modal-demo-example-1/modal-content/modal-demo-example-1.component.scss`,
    TS: `${BASE_REQUEST_PATH}/modal-demo-example-1/modal-demo-example-1-helper/modal-demo-example-1-helper.component.ts`,
  };

  public readonly example2Content: Record<string, string> = {
    HTML: `${BASE_REQUEST_PATH}/modal-demo-example-2/modal-content/modal-demo-example-2.component.html`,
    SCSS: `${BASE_REQUEST_PATH}/modal-demo-example-2/modal-content/modal-demo-example-2.component.scss`,
    TS: `${BASE_REQUEST_PATH}/modal-demo-example-2/modal-demo-example-2-helper/modal-demo-example-2-helper.component.ts`,
  };

  public readonly example3Content: Record<string, string> = {
    HTML: `${BASE_REQUEST_PATH}/modal-demo-example-3/modal-content/modal-demo-example-3.component.html`,
    SCSS: `${BASE_REQUEST_PATH}/modal-demo-example-3/modal-content/modal-demo-example-3.component.scss`,
    TS: `${BASE_REQUEST_PATH}/modal-demo-example-3/modal-demo-example-3-helper/modal-demo-example-3-helper.component.ts`,
  };

  public readonly example4Content: Record<string, string> = {
    HTML: `${BASE_REQUEST_PATH}/modal-demo-example-4/modal-content/modal-demo-example-4.component.html`,
    SCSS: `${BASE_REQUEST_PATH}/modal-demo-example-4/modal-content/modal-demo-example-4.component.scss`,
    TS: `${BASE_REQUEST_PATH}/modal-demo-example-4/modal-demo-example-4-helper/modal-demo-example-4-helper.component.ts`,
  };

  public readonly formGroup: FormGroup = new FormGroup({
    hasBackdrop: new FormControl(true),
    closeOnBackdropClick: new FormControl(true),
    isBackdropTransparent: new FormControl(false),
    isFullscreen: new FormControl(false),
  });

  constructor(private readonly modalsService: ModalsService, private readonly injector: Injector) {}

  public openModal(): void {
    const openedModal: OpenedModal<string> = this.modalsService.open(ModalDemoContentComponent, {
      ...this.formGroup.value,
      injector: this.injector,
      height: 400,
      width: 400,
      providers: [
        {
          provide: MODAL_DATA_TOKEN,
          useValue: [1, 2, 3, 4],
        },
      ],
    });

    // eslint-disable-next-line no-console
    openedModal.closed$.subscribe((text: string) => console.log(`Modal closed: ${text}`));
    // eslint-disable-next-line no-console
    openedModal.positionUpdated$.subscribe((position: Position) => console.log('Modal position updated:', position));
  }
}
