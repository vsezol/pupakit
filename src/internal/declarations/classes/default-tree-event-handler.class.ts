import { EventBus } from '@bimeister/event-bus';
import { isNil } from '@bimeister/utilities';
import { Subscription } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { DefaultEventHandler } from './default-event-handler.class';
import { FlatTreeItem } from './flat-tree-item.class';
import { TreeDataDisplayCollection } from './tree-data-display-collection.class';
import { QueueEvents } from '../events/queue.events';
import { DataEvents } from '../events/data.events';
import { TreeEvents } from '../events/tree.events';

export class DefaultTreeEventHandler extends DefaultEventHandler {
  constructor(
    protected readonly eventBus: EventBus,
    protected readonly dataDisplayCollection: TreeDataDisplayCollection
  ) {
    super(eventBus, dataDisplayCollection);
  }

  protected getSubscriptionForRemoveItem(): Subscription {
    return this.getEvents(DataEvents.RemoveItem)
      .pipe(withLatestFrom(this.dataDisplayCollection.data$, this.dataDisplayCollection.expandedIdsList$))
      .subscribe(([event, data, expandedIdsList]: [DataEvents.RemoveItem, FlatTreeItem[], string[]]) => {
        this.removeItemWithChildren(event.payload, data, expandedIdsList);
        this.eventBus.dispatch(new QueueEvents.RemoveFromQueue(event.id));
      });
  }

  protected subscribeToEvents(): void {
    super.subscribeToEvents();
    this.subscription.add(this.getSubscriptionForRemoveChildren());
    this.subscription.add(this.getSubscriptionForSetChildren());
  }

  private getSubscriptionForSetChildren(): Subscription {
    return this.getEvents(TreeEvents.SetChildren)
      .pipe(withLatestFrom(this.dataDisplayCollection.data$, this.dataDisplayCollection.expandedIdsList$))
      .subscribe(([event, data, expandedIdsList]: [TreeEvents.SetChildren, FlatTreeItem[], string[]]) => {
        this.setChildren(event.payload.treeItemId, event.payload.children, data, expandedIdsList);
        this.eventBus.dispatch(new QueueEvents.RemoveFromQueue(event.id));
      });
  }

  private getSubscriptionForRemoveChildren(): Subscription {
    return this.getEvents(TreeEvents.RemoveChildren)
      .pipe(withLatestFrom(this.dataDisplayCollection.data$, this.dataDisplayCollection.expandedIdsList$))
      .subscribe(([event, data, expandedIdsList]: [TreeEvents.RemoveChildren, FlatTreeItem[], string[]]) => {
        this.removeChildren(event.payload, data, expandedIdsList);
        this.eventBus.dispatch(new QueueEvents.RemoveFromQueue(event.id));
      });
  }

  private setChildren(
    parentId: string,
    children: FlatTreeItem[],
    data: FlatTreeItem[],
    expandedIdsList: string[]
  ): void {
    if (isNil(parentId)) {
      const newData: FlatTreeItem[] = children.map(treeItem => ({ ...treeItem, level: 0 }));
      this.eventBus.dispatch(new DataEvents.SetData(newData));
      this.eventBus.dispatch(new TreeEvents.SetExpanded([]));
      return;
    }
    const parentIsExpanded: boolean = expandedIdsList.includes(parentId);
    if (parentIsExpanded) {
      return;
    }
    const parent: FlatTreeItem = DefaultEventHandler.getTreeItem(parentId, data);
    const isExpanded: boolean = expandedIdsList.includes(parentId);
    if (isNil(parent) || isExpanded) {
      return;
    }
    const childrenIdsSet: Set<string> = new Set();
    const childrenWithLevel: FlatTreeItem[] = children.map((childItem: FlatTreeItem) => {
      childrenIdsSet.add(childItem.id);
      return {
        ...childItem,
        level: parent.level + 1
      };
    });
    const parentIndex: number = data.indexOf(parent);
    const dataWithChildren: FlatTreeItem[] = [
      ...data.slice(0, parentIndex),
      parent,
      ...childrenWithLevel,
      ...data.slice(parentIndex + 1)
    ];
    const noExpandedChildrenList: string[] = expandedIdsList.filter(
      (expandedTreeItemId: string) => !childrenIdsSet.has(expandedTreeItemId)
    );
    const newExpandedList: string[] = [...noExpandedChildrenList, parent.id];
    this.eventBus.dispatch(new DataEvents.SetData(dataWithChildren));
    this.eventBus.dispatch(new TreeEvents.SetExpanded(newExpandedList));
  }

  private removeItemWithChildren(removeItemId: string, data: FlatTreeItem[], expanded: string[]): void {
    const treeItemExists: boolean = DefaultEventHandler.treeItemExists(removeItemId, data);
    if (!treeItemExists) {
      return;
    }
    const [dataWithoutChildren, expandedWithoutChildren]: [FlatTreeItem[], string[]] = this.getRemovedChildren(
      removeItemId,
      data,
      expanded
    );
    const dataWithoutRemovedItem: FlatTreeItem[] = dataWithoutChildren.filter((treeItem: FlatTreeItem) => {
      return treeItem.id !== removeItemId;
    });
    this.eventBus.dispatch(new DataEvents.SetData(dataWithoutRemovedItem));
    this.eventBus.dispatch(new TreeEvents.SetExpanded(expandedWithoutChildren));
  }

  private removeChildren(parentId: string, data: FlatTreeItem[], expanded: string[]): void {
    const [dataWithoutChildren, expandedWithoutChildren]: [FlatTreeItem[], string[]] = this.getRemovedChildren(
      parentId,
      data,
      expanded
    );
    this.eventBus.dispatch(new DataEvents.SetData(dataWithoutChildren));
    this.eventBus.dispatch(new TreeEvents.SetExpanded(expandedWithoutChildren));
  }

  private getRemovedChildren(parentId: string, data: FlatTreeItem[], expanded: string[]): [FlatTreeItem[], string[]] {
    const parent: FlatTreeItem = DefaultEventHandler.getTreeItem(parentId, data);
    if (isNil(parent)) {
      return [data, expanded];
    }
    const parentIndex: number = data.indexOf(parent);
    const dataBeforeParent: FlatTreeItem[] = parentIndex === 0 ? [] : data.slice(0, parentIndex);
    const dataAfterParent: FlatTreeItem[] = data.slice(parentIndex + 1);
    const nextNonChildIndex: number = dataAfterParent.findIndex((dataItem: FlatTreeItem) => {
      return dataItem.level <= parent.level;
    });
    const isLastParent: boolean = nextNonChildIndex === -1;
    const children: FlatTreeItem[] = dataAfterParent.slice(0, nextNonChildIndex);
    const childrenIdsList: string[] = children.map((child: FlatTreeItem) => child.id);
    const expandedWithoutChildren: string[] = expanded.filter(
      (expandedItemId: string) => !childrenIdsList.includes(expandedItemId) && expandedItemId !== parentId
    );
    const dataAfterLastChild: FlatTreeItem[] = isLastParent ? [] : dataAfterParent.slice(nextNonChildIndex);
    const dataWithoutChildren: FlatTreeItem[] = [...dataBeforeParent, parent, ...dataAfterLastChild];
    return [dataWithoutChildren, expandedWithoutChildren];
  }
}