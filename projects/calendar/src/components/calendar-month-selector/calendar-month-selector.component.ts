import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { isNil } from '@bimeister/utilities';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MONTHS_IN_YEAR } from '../../declarations/constants/months-in-year.const';
import { CalendarTextKey } from '../../declarations/enums/calendar-text-key.enum';
import { MonthIndex } from '../../declarations/enums/month-index.enum';
import { CalendarMonth } from '../../declarations/interfaces/calendar-month.interface';
import { CalendarTranslation } from '../../declarations/interfaces/calendar-translation.interface';
import { CalendarConfigService } from '../../services/calendar-config.service';
import { CalendarTranslationService } from '../../services/calendar-translation.service';

const DIVIDER_HEIGHT_PX: number = 12;
const YEAR_LABEL_HEIGHT_PX: number = 16;
const YEAR_TABLE_HEIGHT_PX: number = 188;

const ITEM_HEIGHT_PX: number = DIVIDER_HEIGHT_PX * 2 + YEAR_LABEL_HEIGHT_PX + YEAR_TABLE_HEIGHT_PX;

@Component({
  selector: 'pupa-calendar-month-selector',
  templateUrl: './calendar-month-selector.component.html',
  styleUrls: ['./calendar-month-selector.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthSelectorComponent implements AfterViewInit {
  @Output() public select: EventEmitter<CalendarMonth> = new EventEmitter<CalendarMonth>();

  @ViewChild(CdkVirtualScrollViewport)
  private readonly virtualScrollViewport: CdkVirtualScrollViewport;

  private readonly virtualScrollViewport$: Subject<CdkVirtualScrollViewport> = new Subject<CdkVirtualScrollViewport>();

  public readonly headerTitle$: Observable<string> = this.calendarTranslationService.translation$.pipe(
    map((translation: CalendarTranslation) => translation.texts[CalendarTextKey.SelectMonth])
  );

  public readonly itemHeight: number = ITEM_HEIGHT_PX;

  public readonly startYear: number = this.calendarConfigService.startYear;

  public readonly currentYearInScroll$: Observable<number> = this.virtualScrollViewport$.pipe(
    switchMap((viewport: CdkVirtualScrollViewport) => viewport.scrolledIndexChange),
    map((index: number) => index + this.startYear)
  );

  public readonly yearsIndexes: unknown[] = Array.from({
    length: this.calendarConfigService.yearsRange,
  });
  public readonly monthsIndexes: unknown[] = Array.from({ length: MONTHS_IN_YEAR });

  public readonly monthNameByIndex$: Observable<Record<MonthIndex, string>> =
    this.calendarTranslationService.translation$.pipe(map((translation: CalendarTranslation) => translation.months));

  constructor(
    private readonly calendarTranslationService: CalendarTranslationService,
    private readonly calendarConfigService: CalendarConfigService
  ) {}

  public ngAfterViewInit(): void {
    this.scrollToCurrentYear();

    if (!isNil(this.virtualScrollViewport)) {
      this.virtualScrollViewport$.next(this.virtualScrollViewport);
    }
  }

  public selectMonth(year: number, month: number): void {
    this.select.emit({
      year,
      month,
    });
  }

  private scrollToCurrentYear(): void {
    if (isNil(this.virtualScrollViewport)) {
      return;
    }

    const currentYearIndex: number = new Date().getFullYear() - this.startYear;

    requestAnimationFrame(() => {
      this.virtualScrollViewport.scrollToIndex(currentYearIndex);
    });
  }
}
