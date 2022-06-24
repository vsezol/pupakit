import { EventBus } from '@bimeister/event-bus/rxjs';
import { filterByInstanceOf, filterTruthy, isNil, shareReplayWithRefCount } from '@bimeister/utilities';
import { forkJoin, merge, NEVER, Observable, of, Subscription } from 'rxjs';
import { filter, map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { ClientUiStateHandlerService } from '../../../shared/services/client-ui-state-handler.service';
import { QueueEvents } from '../../events/queue.events';
import { TableColumnEvents } from '../../events/table-column.events';
import { TableEvents } from '../../events/table.events';
import { TableApi } from '../../interfaces/table-api.interface';
import { TableEventTargetCellData } from '../../interfaces/table-event-target-cell-data.interface';
import { TableFeature } from '../../interfaces/table-feature.interface';
import { TableColumnSizeState } from '../table-column-size-state.class';
import { TableColumn } from '../table-column.class';

export class TableResizeFeature<T> implements TableFeature {
  private readonly eventBus: EventBus = this.api.eventBus;
  public readonly clientUiStateHandlerService: ClientUiStateHandlerService =
    this.api.tableInjector.get(ClientUiStateHandlerService);

  private readonly columnIdToColumnMap$: Observable<Map<string, TableColumn>> =
    this.api.displayData.columnIdToColumnMap$;

  private columnIdToColumnSizeStateMap: Map<string, TableColumnSizeState> = new Map<string, TableColumnSizeState>();
  private readonly columnIdToColumnSizeStateMap$: Observable<Map<string, TableColumnSizeState>> =
    this.columnIdToColumnMap$.pipe(
      map((columnIdToColumnMap: Map<string, TableColumn>) => {
        const newStatesMap: Map<string, TableColumnSizeState> = new Map<string, TableColumnSizeState>();

        for (const [columnId, column] of columnIdToColumnMap.entries()) {
          const sizeState: TableColumnSizeState =
            this.columnIdToColumnSizeStateMap.get(columnId) ??
            new TableColumnSizeState(this.clientUiStateHandlerService);
          sizeState.setDefinitionSizes(column.definition.defaultSizes, column.definition.adaptiveSizes);
          newStatesMap.set(columnId, sizeState);
        }

        this.columnIdToColumnSizeStateMap = newStatesMap;
        return newStatesMap;
      }),
      shareReplayWithRefCount()
    );

  private readonly subscription: Subscription = new Subscription();

  private currentResizableColumn: TableColumn | null = null;
  private lastDeltaPx: number = 0;

  constructor(private readonly api: TableApi<T>) {
    this.subscription.add(this.processPanStart());
    this.subscription.add(this.processPan());
    this.subscription.add(this.processPanEnd());
    this.subscription.add(this.processOuterUpdateColumnWidthByDeltaEvent());
    this.subscription.add(this.processOuterSetColumnWidthEvent());
    this.subscription.add(this.processColumnWidthChanges());
    this.subscription.add(this.processColumnRequestWidth());
  }

  public dispose(): void {
    this.subscription.unsubscribe();
  }

  private processPanStart(): Subscription {
    return this.eventBus
      .listen()
      .pipe(
        filterByInstanceOf(TableEvents.PanStart),
        filter((event: TableEvents.PanStart) => !isNil(event.targetCell) && event.triggeredByResizer)
      )
      .subscribe((event: TableEvents.PanStart) => {
        this.startResize(event.targetCell);
      });
  }

  private processPan(): Subscription {
    return this.eventBus
      .listen()
      .pipe(filterByInstanceOf(TableEvents.Pan))
      .subscribe((event: TableEvents.Pan) => this.updateColumnWidth(event));
  }

  private processPanEnd(): Subscription {
    return this.eventBus
      .listen()
      .pipe(filterByInstanceOf(TableEvents.PanEnd))
      .subscribe(() => {
        this.currentResizableColumn?.dispatchEvent(new TableColumnEvents.CurrentResizableChanged(false));
        this.currentResizableColumn = null;
        this.lastDeltaPx = 0;
      });
  }

  private processOuterUpdateColumnWidthByDeltaEvent(): Subscription {
    return this.eventBus
      .listen()
      .pipe(
        filterByInstanceOf(TableEvents.UpdateColumnWidthByDelta),
        withLatestFrom(this.columnIdToColumnSizeStateMap$),
        map(
          ([event, columnIdToSizeStateMap]: [
            TableEvents.UpdateColumnWidthByDelta,
            Map<string, TableColumnSizeState>
          ]) => {
            columnIdToSizeStateMap.get(event.columnId)?.updateWidthByDeltaPx(event.deltaPx);
            return event;
          }
        )
      )
      .subscribe((event: TableEvents.UpdateColumnWidthByDelta) =>
        this.eventBus.dispatch(new QueueEvents.RemoveFromQueue(event.id))
      );
  }

  private processOuterSetColumnWidthEvent(): Subscription {
    return this.eventBus
      .listen()
      .pipe(
        filterByInstanceOf(TableEvents.SetColumnWidth),
        withLatestFrom(this.columnIdToColumnSizeStateMap$),
        map(([event, columnIdToSizeState]: [TableEvents.SetColumnWidth, Map<string, TableColumnSizeState>]) => {
          columnIdToSizeState.get(event.columnId)?.setWidth(event.widthPx);
          return event;
        })
      )
      .subscribe((event: TableEvents.SetColumnWidth) =>
        this.eventBus.dispatch(new QueueEvents.RemoveFromQueue(event.id))
      );
  }

  private processColumnWidthChanges(): Subscription {
    return this.columnIdToColumnSizeStateMap$
      .pipe(
        switchMap((columnIdToColumnSizeStateMap: Map<string, TableColumnSizeState>) => {
          const widthStreams: Observable<[string, number]>[] = Array.from(columnIdToColumnSizeStateMap.entries()).map(
            ([columnId, state]: [string, TableColumnSizeState]) =>
              state.widthPx$.pipe(map((widthPx: number) => [columnId, widthPx]))
          );

          return merge(...widthStreams).pipe(withLatestFrom(this.columnIdToColumnMap$));
        })
      )
      .subscribe(([[columnId, widthPx], columnIdToColumnMap]: [[string, number], Map<string, TableColumn>]) => {
        columnIdToColumnMap.get(columnId)?.dispatchEvent(new TableColumnEvents.WidthChanged(widthPx));
      });
  }

  private processColumnRequestWidth(): Subscription {
    type MainSteamTuple = [TableColumnEvents.GetCurrentWidth, TableColumn, number];
    type EventWithSizesTuple = [TableColumnEvents.GetCurrentWidth, Map<string, TableColumnSizeState>];

    return this.columnIdToColumnMap$
      .pipe(
        switchMap((columnIdToColumnMap: Map<string, TableColumn>) => {
          const streams: Observable<MainSteamTuple>[] = Array.from(columnIdToColumnMap.entries()).map(
            ([columnId, column]: [string, TableColumn]) =>
              column.listenEvent(TableColumnEvents.GetCurrentWidth).pipe(
                withLatestFrom(this.columnIdToColumnSizeStateMap$),
                switchMap(([event, columnIdToColumnSizeStateMap]: EventWithSizesTuple) => {
                  const currentWidthPx$: Observable<number> =
                    columnIdToColumnSizeStateMap.get(columnId).widthPx$.pipe(take(1)) ?? of(0);

                  return forkJoin([of(event), of(column), currentWidthPx$]);
                })
              )
          );

          return merge(...streams);
        })
      )
      .subscribe(([event, column, currentWidthPx]: MainSteamTuple) =>
        column.dispatchEvent(new TableColumnEvents.CurrentWidthResponse(event.id, currentWidthPx))
      );
  }

  private startResize(targetCell: TableEventTargetCellData): void {
    this.columnIdToColumnMap$.pipe(take(1)).subscribe((columnIdToColumnMap: Map<string, TableColumn>) => {
      this.lastDeltaPx = 0;
      const targetColumn: TableColumn = columnIdToColumnMap.get(targetCell.columnId);
      targetColumn.dispatchEvent(new TableColumnEvents.CurrentResizableChanged(true));
      this.currentResizableColumn = targetColumn;
    });
  }

  private updateColumnWidth(event: TableEvents.Pan): void {
    const deltaPx: number = event.panDelta[0] - this.lastDeltaPx;

    this.columnIdToColumnSizeStateMap$
      .pipe(
        take(1),
        switchMap((columnIdToColumnSizeStateMap: Map<string, TableColumnSizeState>) => {
          const columnId: string | undefined = this.currentResizableColumn?.definition.id;

          if (isNil(columnId)) {
            return NEVER;
          }

          const sizeState: TableColumnSizeState | undefined = columnIdToColumnSizeStateMap.get(columnId);

          if (isNil(sizeState)) {
            return NEVER;
          }

          const result$: Observable<boolean> = sizeState.updateWidthByDeltaPx(deltaPx);

          return result$.pipe(
            filterTruthy(),
            switchMap(() => forkJoin([sizeState.widthPx$.pipe(take(1)), of(columnId)]))
          );
        })
      )
      .subscribe(([newWidthPx, columnId]: [number, string]) => {
        this.eventBus.dispatch(new TableEvents.ColumnWidthChanged(newWidthPx, columnId));
        this.lastDeltaPx = event.panDelta[0];
      });
  }
}