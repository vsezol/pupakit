import { Injectable } from '@angular/core';
import { TabsServiceBase } from '../../../../internal/declarations/classes/abstract/tabs-service-base.abstract';

@Injectable()
export class StepperStateService<T> extends TabsServiceBase<T> {}
