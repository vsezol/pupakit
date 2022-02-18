import {
  Attribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { SelectTreeBase } from '../../../../../internal/declarations/classes/abstract/select-tree-base.abstract';
import { FlatTreeItem } from '../../../../../internal/declarations/classes/flat-tree-item.class';
import { TreeType } from '../../../../../internal/declarations/enums/tree-type.enum';
import { TreeItemInterface } from '../../../../../internal/declarations/interfaces/tree-item.interface';
import { Uuid } from '../../../../../internal/declarations/types/uuid.type';
import { TreeComponent } from '../../../tree/components/tree/tree.component';
import { SelectStateService } from '../../services/select-state.service';

/**
 * @deprecated remove ViewEncapsulation.None when tree styling is available
 * need support new design
 */
@Component({
  selector: 'pupa-select-tree',
  templateUrl: './select-tree.component.html',
  styleUrls: ['./select-tree.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTreeComponent extends SelectTreeBase {
  @ViewChild('customPupaTreeComponent') public readonly customPupaTreeComponent: TreeComponent;
  @ViewChild('hierarchicalTreeComponent') public readonly hierarchicalTreeComponent: TreeComponent;
  @ViewChild('flatTreeComponent') public readonly flatTreeComponent: TreeComponent;

  /**
   * @description
   * Already flatten tree data source.
   */
  @Input() public readonly flatDataOrigin: FlatTreeItem[] = [];

  /**
   * @description
   * Flatten tree nodes (folders) to be combined with treeElementsOrigin.
   */
  @Input() public readonly treeNodesOrigin: TreeItemInterface[] = [];

  /**
   * @description
   * Flatten tree elements (folder items) to be combined with treeNodesOrigin.
   */
  @Input() public readonly treeElementsOrigin: TreeItemInterface[] = [];

  @Input() public hideRoot: boolean = false;
  @Input() public isLoading: boolean = false;

  @Input() public isNodeSelectionEnabled: boolean = false;

  @Input() public readonly nodeTemplate?: TemplateRef<unknown>;

  @Output() public readonly expandedNode: EventEmitter<FlatTreeItem> = new EventEmitter();

  constructor(@Attribute('type') type: TreeType, selectStateService: SelectStateService<Uuid>) {
    super(type, selectStateService);
  }
}