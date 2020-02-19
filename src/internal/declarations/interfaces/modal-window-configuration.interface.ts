import { ModalWindowSize } from '../types/modal-window-size.type';

export interface ModalWindowConfiguration {
  icon?: string;
  colorIcon?: string;
  title?: string;
  size?: ModalWindowSize;
  enableOverlay?: boolean;
  clickableOverlay?: boolean;
  zIndex?: number;
  closeButton?: boolean;
  data?: Record<string, any>;
  canMove?: boolean;
  canPadding?: boolean;
}