import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'demo-tree',
  styleUrls: ['../demo.scss'],
  templateUrl: './tree-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeDemoComponent {
  public items: any[] = [
    {
      key: '1',
      value: '1 Пункт',
      icon: 'man',
      children: []
    },
    {
      key: '2',
      value: '2 Пункт Пункт с длинным названием Пункт с длинным названием',
      icon: 'man',
      children: [
        {
          key: '2_1',
          value: '2_1 Пункт Пункт с длинным названием Пункт с длинным названием',
          icon: 'man',
          children: []
        },
        {
          key: '2_2',
          value: '2_2 Пункт',
          icon: 'man',
          children: []
        },
        {
          key: '2_3',
          value: '2_3 Пункт',
          icon: 'man',
          children: [
            {
              key: '2_3_1',
              value: '2_3_1 Пункт с длинным названием',
              icon: 'man',
              children: []
            },
            {
              key: '2_3_2',
              value: '2_3_2 Пункт',
              icon: 'man',
              children: []
            },
            {
              key: '2_3_3',
              value: '2_3_3 Пункт',
              icon: 'man',
              children: []
            }
          ]
        },
        {
          key: '2_4',
          value: '2_4 Пункт',
          icon: 'man',
          children: []
        }
      ]
    },
    {
      key: '3',
      value: '3 Пункт',
      icon: 'man',
      children: []
    },
    {
      key: '4',
      value: '4 Пункт',
      icon: 'man',
      children: []
    },
    {
      key: '5',
      value: '5 Пункт',
      icon: 'man',
      children: []
    }
  ];

  public notActiveKeys: string[] = [];

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  public clickItem(key: string): void {
    this.notActiveKeys.push(key);
    this.notActiveKeys = [...this.notActiveKeys];
    this.changeDetector.markForCheck();
    // tslint:disable-next-line: no-console
    console.log(`key: ${key}`);
  }
}