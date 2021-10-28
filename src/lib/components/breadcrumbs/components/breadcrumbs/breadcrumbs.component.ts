import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { filterNotEmpty, filterNotNil, isEmpty, isNil, Nullable, resizeObservable } from '@bimeister/utilities';
import { animationFrameScheduler, BehaviorSubject, combineLatest, merge, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, observeOn, switchMap } from 'rxjs/operators';
import { BreadcrumbsProducer } from '../../../../../internal/declarations/classes/breadcrumbs-producer.class';
import { BreadcrumbContext } from '../../../../../internal/declarations/interfaces/breadcrumb-context.interface';
import { Breadcrumb } from '../../../../../internal/declarations/interfaces/breadcrumb.interface';
import { BreadcrumbsParts } from '../../../../../internal/declarations/interfaces/breadcrumbs-parts.interface';
import { ComponentChange } from '../../../../../internal/declarations/interfaces/component-change.interface';
import { ComponentChanges } from '../../../../../internal/declarations/interfaces/component-changes.interface';
import { ClientUiStateHandlerService } from '../../../../../internal/shared/services/client-ui-state-handler.service';
import { PupaBreadcrumbTemplateDirective } from '../../directives/table-cell-template.directive';

const CAPACITY_CALCULATING_DEBOUNCE_TIME_MS: number = 200;

@Component({
  selector: 'pupa-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() public breadcrumbs: Breadcrumb[] = [];
  public readonly breadcrumbs$: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);

  @ViewChild('breadcrumbs') private readonly breadcrumbsContainerRef: ElementRef<HTMLElement>;
  @ViewChildren('breadcrumb') private readonly breadcrumbList: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('unfitBreadcrumbsTrigger') private readonly unfitBreadcrumbsTriggerRef: ElementRef<HTMLElement>;
  @ViewChild('defaultInnerTemplate') private readonly defaultInnerTemplateRef: TemplateRef<BreadcrumbContext>;

  @ContentChild(PupaBreadcrumbTemplateDirective) public readonly breadcrumbTemplate: PupaBreadcrumbTemplateDirective;

  private readonly breadcrumbsContainer$: BehaviorSubject<Nullable<HTMLElement>> = new BehaviorSubject<
    Nullable<HTMLDivElement>
  >(null);

  private readonly breadcrumbList$: BehaviorSubject<HTMLElement[]> = new BehaviorSubject<HTMLElement[]>([]);
  private readonly breadcrumbWidthList$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  private readonly unfitBreadcrumbTriggerWidthPx$: BehaviorSubject<Nullable<number>> = new BehaviorSubject<
    Nullable<number>
  >(null);
  public readonly isContainerFullFitted$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private readonly breadcrumbsContainerWidthPx$: Observable<number> = this.breadcrumbsContainer$.pipe(
    observeOn(animationFrameScheduler),
    distinctUntilChanged(),
    switchMap((element: Nullable<HTMLDivElement>) => (!isNil(element) ? resizeObservable(element) : of([]))),
    map(([entry]: ResizeObserverEntry[]) => (!isNil(entry) ? entry.contentRect.width : 0))
  );

  public readonly isMobile$: Observable<boolean> = this.clientUiStateHandlerService.breakpointIsLessThanMd$;

  public readonly unfitBreadcrumbs$: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);
  public readonly fitBreadcrumbs$: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);
  public readonly rootBreadcrumb$: BehaviorSubject<Nullable<Breadcrumb>> = new BehaviorSubject<Nullable<Breadcrumb>>(
    null
  );

  private readonly subscription: Subscription = new Subscription();
  constructor(
    private readonly clientUiStateHandlerService: ClientUiStateHandlerService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  public ngAfterViewInit(): void {
    this.setBreadcrumbsContainer();
    this.setOverflowBreadcrumbTriggerWidth();
    this.subscription.add(this.setBreadcrumbListOnChanges());

    this.subscription.add(this.calculateBreadcrumbsWidths());
    this.subscription.add(this.calculateIsContainerFullFitted());
    this.subscription.add(this.calculateBreadcrumbsPlacement());
  }

  public ngOnChanges(changes: ComponentChanges<this>): void {
    this.processBreadcrumbChange(changes?.breadcrumbs);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getBreadcrumbTemplate(): TemplateRef<BreadcrumbContext> {
    return this.breadcrumbTemplate?.templateRef ?? this.defaultInnerTemplateRef;
  }

  public handleClickOnUnfitTrigger(): void {
    this.detectChanges();
  }

  private processBreadcrumbChange(change: ComponentChange<this, Breadcrumb[]>): void {
    const updatedBreadcrumbs: Breadcrumb[] | undefined = change?.currentValue;

    if (!Array.isArray(updatedBreadcrumbs) || isEmpty(updatedBreadcrumbs)) {
      return;
    }

    this.breadcrumbs$.next(updatedBreadcrumbs);

    if (updatedBreadcrumbs.length > 1) {
      this.rootBreadcrumb$.next(updatedBreadcrumbs[0]);
    }
  }

  private setBreadcrumbsContainer(): void {
    this.breadcrumbsContainer$.next(this.breadcrumbsContainerRef.nativeElement);
  }

  private setOverflowBreadcrumbTriggerWidth(): void {
    const triggerElement: HTMLElement = this.unfitBreadcrumbsTriggerRef.nativeElement;
    this.unfitBreadcrumbTriggerWidthPx$.next(triggerElement.offsetWidth);
  }

  private setBreadcrumbListOnChanges(): Subscription {
    return merge(this.breadcrumbList.changes, of(this.breadcrumbList)).subscribe(
      (breadcrumbList: QueryList<ElementRef<HTMLElement>>) => {
        this.breadcrumbList$.next(breadcrumbList.map(({ nativeElement }: ElementRef<HTMLElement>) => nativeElement));
      }
    );
  }

  private calculateBreadcrumbsWidths(): Subscription {
    return this.breadcrumbsContainerWidthPx$
      .pipe(
        observeOn(animationFrameScheduler),
        switchMap(() => this.breadcrumbList$),
        filterNotEmpty(),
        map((breadcrumbElementList: HTMLElement[]) =>
          breadcrumbElementList.map(({ offsetWidth }: HTMLElement) => offsetWidth)
        )
      )
      .subscribe((elementWidthList: number[]) => this.breadcrumbWidthList$.next(elementWidthList));
  }

  private calculateIsContainerFullFitted(): Subscription {
    return combineLatest([this.breadcrumbsContainerWidthPx$, this.breadcrumbWidthList$])
      .pipe(
        map(([containerWidth, widthList]: [number, number[]]) => {
          const sumOfWidths: number = widthList.reduce((partialSum, currentWidth) => partialSum + currentWidth, 0);
          return sumOfWidths <= containerWidth;
        })
      )
      .subscribe((isContainerFullFitted: boolean) => this.isContainerFullFitted$.next(isContainerFullFitted));
  }

  private calculateBreadcrumbsPlacement(): Subscription {
    return combineLatest([
      this.breadcrumbs$,
      this.breadcrumbsContainerWidthPx$,
      this.isContainerFullFitted$,
      this.breadcrumbWidthList$.pipe(filterNotEmpty()),
      this.isMobile$,
      this.unfitBreadcrumbTriggerWidthPx$.pipe(filterNotNil()),
      this.rootBreadcrumb$
    ])
      .pipe(
        observeOn(animationFrameScheduler),
        debounceTime(CAPACITY_CALCULATING_DEBOUNCE_TIME_MS),
        map(
          ([
            breadcrumbs,
            breadcrumbsContainerWidthPx,
            isContainerFullFitted,
            breadcrumbWidthList,
            isMobile,
            unfitBreadcrumbTriggerWidthPx,
            rootBreadcrumb
          ]: [Breadcrumb[], number, boolean, number[], boolean, number, Nullable<Breadcrumb>]) =>
            new BreadcrumbsProducer({
              breadcrumbs,
              breadcrumbsContainerWidthPx,
              isContainerFullFitted,
              breadcrumbWidthList,
              isMobile,
              unfitBreadcrumbTriggerWidthPx,
              rootBreadcrumb
            }).getBreadcrumbsParts()
        )
      )
      .subscribe(({ unfitBreadcrumbs, fitBreadcrumbs }: BreadcrumbsParts) => {
        this.unfitBreadcrumbs$.next(unfitBreadcrumbs);
        this.fitBreadcrumbs$.next(fitBreadcrumbs);

        this.detectChanges();
      });
  }

  private detectChanges(): void {
    this.changeDetectorRef.detectChanges();
  }
}