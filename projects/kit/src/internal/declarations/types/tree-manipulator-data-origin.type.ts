import { TreeType } from '../enums/tree-type.enum';
import { TreeManipulatorCustomDataOrigin } from '../interfaces/tree-manipulator-custom-data-origin.interface';
import { TreeManipulatorFlatDataOrigin } from '../interfaces/tree-manipulator-flat-data-origin.interface';
import { TreeManipulatorHierarchicalDataOrigin } from '../interfaces/tree-manipulator-hierarchical-data-origin.interface';

export type TreeManipulatorDataOrigin<T extends TreeType = TreeType> = T extends TreeType.Flat
  ? TreeManipulatorFlatDataOrigin
  : T extends TreeType.Hierarchical
  ? TreeManipulatorHierarchicalDataOrigin
  : T extends TreeType.Custom
  ? TreeManipulatorCustomDataOrigin
  : never;