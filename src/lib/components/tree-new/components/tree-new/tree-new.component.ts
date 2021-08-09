import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import { filterNotNil, isEmpty, isNil, Nullable } from '@bimeister/utilities';
import {
  animationFrameScheduler,
  BehaviorSubject,
  combineLatest,
  interval,
  NEVER,
  Observable,
  ReplaySubject,
  Subscription,
  timer
} from 'rxjs';
import {
  debounce,
  distinctUntilChanged,
  filter,
  map,
  observeOn,
  switchMap,
  take,
  withLatestFrom
} from 'rxjs/operators';
import { FlatTreeItem } from '../../../../../internal/declarations/classes/flat-tree-item.class';
import { TreeDragAndDropControl } from '../../../../../internal/declarations/classes/tree-drag-and-drop.class';
import { TreeManipulatorNew } from '../../../../../internal/declarations/classes/tree-manipulator-new.class';
import { ComponentChanges } from '../../../../../internal/declarations/interfaces/component-changes.interface';
import { DropEventInterface } from '../../../../../internal/declarations/interfaces/drop-event.interface';
import { TreeDataSource } from '../../../../../internal/declarations/interfaces/tree-data-source.interface';

type TreeNodeDisplayConditionFunction<T> = (index: number, nodeData: T) => boolean;

const TREE_ITEM_SIZE_PX: number = 28;
const NODE_HAS_CHILD_COMPARATOR: TreeNodeDisplayConditionFunction<FlatTreeItem> = (
  _: number,
  node: FlatTreeItem
): boolean => {
  return !isNil(node) && node.isExpandable && !node.isElement;
};
const NODE_HAS_NO_CHILD_COMPARATOR: TreeNodeDisplayConditionFunction<FlatTreeItem> = (
  _: number,
  node: FlatTreeItem
): boolean => !isNil(node) && !node.isExpandable && !node.isElement;
const NODE_IS_ELEMENT: TreeNodeDisplayConditionFunction<FlatTreeItem> = (_: number, element: FlatTreeItem): boolean => {
  return !isNil(element) && !element.isExpandable && element.isElement;
};
@Component({
  selector: 'pupa-tree-new',
  templateUrl: './tree-new.component.html',
  styleUrls: ['./tree-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('viewPort', { static: true }) private readonly viewPort: CdkVirtualScrollViewport;
  @ViewChild('skeletonViewPort', { static: true }) private readonly skeletonViewPort: CdkVirtualScrollViewport;
  @ViewChild('draggable') private readonly draggableElement: ElementRef<HTMLElement>;
  @Output() public readonly expandedNode: EventEmitter<FlatTreeItem> = new EventEmitter();
  @Output() public readonly dropped: EventEmitter<DropEventInterface<FlatTreeItem>> = new EventEmitter<
    DropEventInterface<FlatTreeItem>
  >();
  @Output() public readonly visibleElementsCountChanged: EventEmitter<number> = new EventEmitter<number>();

  public readonly treeItemSizePx: number = TREE_ITEM_SIZE_PX;
  public readonly hasChild: TreeNodeDisplayConditionFunction<FlatTreeItem> = NODE_HAS_CHILD_COMPARATOR;
  public readonly hasNoChild: TreeNodeDisplayConditionFunction<FlatTreeItem> = NODE_HAS_NO_CHILD_COMPARATOR;
  public readonly isElement: TreeNodeDisplayConditionFunction<FlatTreeItem> = NODE_IS_ELEMENT;
  private readonly subscription: Subscription = new Subscription();

  private readonly dragAndDropControl: TreeDragAndDropControl = this.manipulator.dragAndDropControl;
  public readonly draggingHasStarted$: Observable<boolean> = this.dragAndDropControl.draggingHasStarted$;
  public readonly draggableNode$: Observable<FlatTreeItem> = this.dragAndDropControl.draggableNode$;
  private readonly dropEmit$: Observable<DropEventInterface<FlatTreeItem>> = this.dragAndDropControl.droppedSubject$;
  private readonly scrollDirection$: Observable<Nullable<'up' | 'down'>> = this.dragAndDropControl.scrollDirection$;
  public readonly expandNodeWithDelay$: Observable<Nullable<FlatTreeItem>> = this.dragAndDropControl
    .expandNodeWithDelay$;
  private readonly expandedItemIds$: Observable<Set<string>> = this.manipulator.expandedItemIds$;
  public readonly treeControl: FlatTreeControl<FlatTreeItem> = this.manipulator.treeControl;
  public readonly dataSource: TreeDataSource = this.manipulator.dataSource;
  public readonly data$: Observable<FlatTreeItem[]> = this.dataSource.filteredData$;
  private readonly viewPortReference$: ReplaySubject<CdkVirtualScrollViewport> = this.manipulator.viewPortReference$;
  private readonly skeletonViewPortReference$: ReplaySubject<CdkVirtualScrollViewport> = this.manipulator
    .skeletonViewPortReference$;
  private readonly listRange$: BehaviorSubject<ListRange> = this.manipulator.listRange$;
  private readonly scrollIndex$: Observable<number> = this.manipulator.scrollIndex$;
  public readonly trackBy$: Observable<TrackByFunction<FlatTreeItem>>;
  public readonly nodeTemplate$: Observable<TemplateRef<unknown>> = this.manipulator.externalNodeTemplate$;
  public readonly selectedNodesIds$: Observable<string[]> = this.manipulator.externalSelectedNodesIds$;
  public readonly highlightedNodesIds$: Observable<string[]> = this.manipulator.externalHighlightedNodesIds$;
  private readonly scrollBehavior$: Observable<ScrollBehavior> = this.manipulator.externalScrollBehavior$;
  private readonly hasDragAndDrop$: Observable<boolean> = this.manipulator.externalHasDragAndDrop$;
  public readonly nodesWithoutPadding$: Observable<boolean> = this.manipulator.externalNodesWithoutPadding$;
  public readonly isLoading$: Observable<boolean> = combineLatest([
    this.manipulator.isLoading$,
    this.manipulator.externalIsLoading$,
    this.manipulator.isScrollByRouteLoading$
  ]).pipe(
    map(([isLoading, externalIsLoading, isScrollByRouteLoading]: [boolean, boolean, boolean]) => {
      return isLoading || externalIsLoading || isScrollByRouteLoading;
    })
  );

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    renderer: Renderer2,
    host: ElementRef<HTMLElement>,
    @Inject(TreeManipulatorNew) private readonly manipulator: TreeManipulatorNew
  ) {
    this.dragAndDropControl.setHostAndRenderer(host, renderer);
  }

  public ngOnInit(): void {
    this.subscription.add(this.detectChangesOnNodeExpansion());
    this.subscription.add(this.scrollViewportDuringDragging());
    this.subscription.add(this.expandNodeDuringDragging());
    this.subscription.add(this.handleCountOfVisibleElementsChanges());
    this.subscription.add(this.processHasDragAndDropChanges());
    this.subscription.add(this.processDroppedEmit());
  }

  public ngOnChanges(changes: ComponentChanges<this>): void {
    if (isNil(changes)) {
      return;
    }
  }

  public ngAfterViewInit(): void {
    this.viewPortReference$.next(this.viewPort);
    this.skeletonViewPortReference$.next(this.skeletonViewPort);
    this.manipulator.refreshViewPort();
    this.subscription.add(this.setInitialVisibleRange());
    this.subscription.add(this.refreshViewPortOnExpandedItemsIdsChange());
    this.subscription.add(this.restoreExpansionForRecreatedElements());
    this.subscription.add(this.updateRangeOnDataExtraction());
    this.subscription.add(this.scrollByIndexOnEmit());

    if (this.manipulator.fetchOnCreate) {
      this.manipulator.refreshData();
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public idsIncludesNodeId(ids: string[], node: FlatTreeItem): boolean {
    return !isNil(node) && Array.isArray(ids) && ids.includes(node.id);
  }

  public toggleExpansion(node: FlatTreeItem): void {
    const nodeId: string = node?.id;
    if (isNil(nodeId)) {
      return;
    }
    this.expandedItemIds$
      .pipe(
        take(1),
        map((expandedItemIds: Set<string>) => expandedItemIds.has(nodeId))
      )
      .subscribe((nodeIsExpanded: boolean) => {
        if (nodeIsExpanded) {
          this.manipulator.collapse([node]);
          return;
        }
        this.manipulator.expand([node.id]);
        this.expandedNode.emit(node);
      });
  }

  public isExpanded(expandedItemsIds: Set<string>, node: FlatTreeItem): boolean {
    return expandedItemsIds.has(node?.id);
  }

  public canDrop(node: FlatTreeItem): boolean {
    return this.dragAndDropControl.canDrop(node);
  }

  @HostListener('window:mousemove', ['$event'])
  public mouseMove(event: MouseEvent): void {
    this.dragAndDropControl.mouseMove(event, this.draggableElement, this.data$);
  }

  @HostListener('window:mouseup')
  public mouseUp(): void {
    this.dragAndDropControl.mouseUp();
  }

  public mouseDown(treeNode: FlatTreeItem, event: MouseEvent): void {
    this.dragAndDropControl.mouseDown(treeNode, event);
  }

  public mouseEnter(node: FlatTreeItem): void {
    this.dragAndDropControl.mouseEnter(node);
  }

  public mouseLeave(): void {
    this.dragAndDropControl.mouseLeave();
  }

  private scrollByIndexOnEmit(): Subscription {
    return this.scrollIndex$
      .pipe(withLatestFrom(this.scrollBehavior$))
      .subscribe(([targetIndex, scrollBehavior]: [number, ScrollBehavior]) => {
        this.viewPort.scrollToIndex(targetIndex, scrollBehavior);
        this.skeletonViewPort.scrollToIndex(targetIndex, scrollBehavior);
      });
  }

  private expandNodeDuringDragging(): Subscription {
    const expandDelay: number = 1000;
    return this.expandNodeWithDelay$
      .pipe(
        debounce(node => (isNil(node) ? NEVER : timer(expandDelay))),
        filter(nodeToExpand => !this.treeControl.isExpanded(nodeToExpand))
      )
      .subscribe((nodeToExpand: FlatTreeItem) => {
        this.treeControl.expand(nodeToExpand);
        this.toggleExpansion(nodeToExpand);
      });
  }

  private handleCountOfVisibleElementsChanges(): Subscription {
    return this.data$
      .pipe(
        map((data: FlatTreeItem[]) => (isNil(data) ? 0 : data.length)),
        distinctUntilChanged()
      )
      .subscribe(countOfVisibleElements => this.visibleElementsCountChanged.emit(countOfVisibleElements));
  }

  private scrollViewportDuringDragging(): Subscription {
    return interval(0)
      .pipe(
        observeOn(animationFrameScheduler),
        withLatestFrom(this.scrollBehavior$, this.scrollDirection$),
        filter(
          ([_, _scrollBehavior, scrollDirection]: [number, ScrollBehavior, Nullable<'up' | 'down'>]) =>
            !isNil(scrollDirection)
        )
      )
      .subscribe(([_, scrollBehavior, scrollDirection]: [number, ScrollBehavior, Nullable<'up' | 'down'>]) => {
        const scrollingSpeed: number = 5;
        const offsetDelta: number = scrollDirection === 'up' ? -scrollingSpeed : scrollingSpeed;
        const currentOffset: number = this.viewPort.measureScrollOffset();
        this.viewPort.scrollToOffset(currentOffset + offsetDelta, scrollBehavior);
      });
  }

  private processHasDragAndDropChanges(): Subscription {
    return this.hasDragAndDrop$.subscribe((hasDragAndDrop: boolean) =>
      this.dragAndDropControl.setHasDragAndDrop(hasDragAndDrop)
    );
  }

  private restoreExpansionForRecreatedElements(): Subscription {
    return this.dataSource.currentSlice$
      .pipe(withLatestFrom(this.expandedItemIds$))
      .subscribe(([treeItems, expandedIds]) => {
        treeItems
          .filter(item => expandedIds.has(item.id))
          .forEach(item => {
            this.treeControl.expand(item);
          });
      });
  }

  private setInitialVisibleRange(): void {
    this.data$
      .pipe(
        filter((nodes: FlatTreeItem[]) => Array.isArray(nodes) && !isEmpty(nodes)),
        take(1),
        withLatestFrom(
          this.viewPortReference$.pipe(
            map((viewPort: CdkVirtualScrollViewport) => viewPort.elementRef),
            map((viewPortNativeElement: ElementRef<HTMLElement>) =>
              viewPortNativeElement.nativeElement.getBoundingClientRect()
            ),
            map((viewPortRect: ClientRect) => viewPortRect.height),
            map((viewPortHeightPx: number) => Math.ceil(viewPortHeightPx / this.treeItemSizePx)),
            map((viewPortItemsCountToFit: number) => {
              const additionItemsToPreRender: number = 10;
              return viewPortItemsCountToFit + additionItemsToPreRender;
            })
          )
        ),
        map(([nodes, maxItemsLimit]: [FlatTreeItem[], number]) => ({
          start: 0,
          end: nodes.length < maxItemsLimit ? nodes.length : maxItemsLimit
        }))
      )
      .subscribe((range: ListRange) => {
        this.listRange$.next(range);
      });
  }

  private updateRangeOnDataExtraction(): Subscription {
    return this.listRange$
      .pipe(
        filterNotNil(),
        take(1),
        switchMap(() => this.viewPortReference$),
        switchMap((viewPort: CdkVirtualScrollViewport) => viewPort.renderedRangeStream)
      )
      .subscribe((range: ListRange) => {
        this.listRange$.next(range);
      });
  }

  private refreshViewPortOnExpandedItemsIdsChange(): Subscription {
    return this.expandedItemIds$.subscribe(() => this.manipulator.refreshViewPort());
  }

  private processDroppedEmit(): Subscription {
    return this.dropEmit$.subscribe((event: DropEventInterface<FlatTreeItem>) => this.dropped.emit(event));
  }

  private detectChangesOnNodeExpansion(): Subscription {
    return this.expandedItemIds$.pipe(filterNotNil()).subscribe(() => this.changeDetectorRef.markForCheck());
  }
}