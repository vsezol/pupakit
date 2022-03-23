import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { distinctUntilSerializedChanged, getUuid } from '@bimeister/utilities';
import { TableController } from '@kit/internal/declarations/classes/table-controller.class';
import { TablePagedDataProducer } from '@kit/internal/declarations/classes/table-paged-data-producer.class';
import { TableColumnPin } from '@kit/internal/declarations/enums/table-column-pin.enum';
import { TableEvents } from '@kit/internal/declarations/events/table.events';
import { PagedVirtualScrollArguments } from '@kit/internal/declarations/interfaces/paged-virtual-scroll-arguments.interface';
import { TableColumnDefinition } from '@kit/internal/declarations/interfaces/table-column-definition.interface';
import { Uuid } from '@kit/internal/declarations/types/uuid.type';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, delay, map, switchMap } from 'rxjs/operators';

interface SomeData {
  id: Uuid;
  firstName: string;
  lastName: string;
  age: number;
}

const BACKEND_DATA: SomeData[] = Array.from({ length: 200 }).map((_value: undefined, index: number) => ({
  id: getUuid(),
  firstName: `Azamat ${index}`,
  lastName: `Aitaliev ${index}`,
  city: 'Moscow',
  age: index + 1,
}));

const COLUMNS: TableColumnDefinition[] = [
  {
    id: 'first-name',
    modelKey: 'firstName',
    title: 'First Name',
    pin: TableColumnPin.None,
    defaultSizes: { widthPx: 200 },
    type: 'first-name',
  },
  {
    id: 'last-name',
    modelKey: 'lastName',
    title: 'Last Name',
    pin: TableColumnPin.None,
    defaultSizes: { widthPx: 200 },
  },
  {
    id: 'city',
    modelKey: 'city',
    title: 'City',
    pin: TableColumnPin.None,
    defaultSizes: { widthPx: 200 },
  },
  {
    id: 'age-column',
    modelKey: 'age',
    title: 'Age',
    pin: TableColumnPin.None,
    defaultSizes: { widthPx: 100 },
  },
];

@Component({
  selector: 'demo-table-example-8',
  templateUrl: './example-8.component.html',
  styleUrls: ['./example-8.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExample8Component implements OnDestroy {
  private readonly subscription: Subscription = new Subscription();
  public readonly rowType: SomeData;

  public readonly controller: TableController<SomeData> = new TableController<SomeData>();
  private readonly pagedDataProducer: TablePagedDataProducer<SomeData> = new TablePagedDataProducer(this.controller);

  private readonly pagedArguments$: Observable<PagedVirtualScrollArguments> = this.pagedDataProducer.arguments$;

  constructor() {
    this.controller.setColumnDefinitions(COLUMNS);
    this.subscription.add(this.processRangeDataChanges());

    this.controller
      .getEvents(TableEvents.ListRangeChanged)
      .pipe(
        debounceTime(500),
        map((event: TableEvents.ListRangeChanged) => event.listRange),
        distinctUntilSerializedChanged()
      )
      .subscribe(console.warn);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private processRangeDataChanges(): Subscription {
    return this.pagedArguments$
      .pipe(
        distinctUntilSerializedChanged(),
        switchMap((pagedArguments: PagedVirtualScrollArguments) => {
          const skip: number = pagedArguments.currentFrom;
          const take: number = pagedArguments.currentTo - pagedArguments.currentFrom;

          return TableExample8Component.getData(skip, take).pipe(
            map(({ total, list }: { total: number; list: SomeData[] }) => {
              const data: SomeData[] = Array.from({ length: total });
              data.splice(skip, take, ...list);

              return data;
            })
          );
        })
      )
      .subscribe((data: SomeData[]) => this.controller.setData(data));
  }

  private static getData(skip: number, take: number): Observable<{ total: number; list: SomeData[] }> {
    const dataSlice: SomeData[] = BACKEND_DATA.slice(skip, skip + take);
    return of({ total: BACKEND_DATA.length, list: dataSlice }).pipe(delay(800));
  }
}