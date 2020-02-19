import { TemplateRef, TrackByFunction } from '@angular/core';
import { Observable } from 'rxjs';

import { FlatTreeItem } from '../classes/flat-tree-item.class';

export interface TreeManipulatorConfiguration {
  readonly dataOrigin$: Observable<FlatTreeItem[]>;
  readonly selectedNodesIds$: Observable<string[]>;
  readonly scrollByRoute$: Observable<string[]>;
  readonly nodeTemplate: TemplateRef<any>;
  readonly trackBy: TrackByFunction<FlatTreeItem>;
}