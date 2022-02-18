import { ColDef, GetRowNodeIdFunc, GridOptions, IDatasource } from 'ag-grid-community';
import { DatagridDomLayouts } from '../enums/datagrid-dom-layouts.enum';
import { DatagridThemes } from '../enums/datagrid-themes.enum';
import { DatagridManipulatorConfigurationData } from '../interfaces/datagrid-manipulator-configuration-data.interface';

export class DatagridManipulatorConfiguration<RowDataT> implements DatagridManipulatorConfigurationData {
  public initialColumnDefs: ColDef[];
  public initialRowData: RowDataT[];

  public initialRowDataSource: IDatasource;
  public sizeColumnsToFit: boolean = false;
  public rowsAutoheight: boolean = false;
  public theme: DatagridThemes = DatagridThemes.Default;
  public domLayout: DatagridDomLayouts = DatagridDomLayouts.Normal;
  public gridOptions: GridOptions = {
    rowSelection: 'single',
    deltaRowDataMode: true,
    defaultColDef: {
      sortable: true,
      unSortIcon: true,
    },
  };

  constructor(config: Partial<DatagridManipulatorConfigurationData>) {
    Object.assign(this, config);
  }

  public rowTrackByFn: GetRowNodeIdFunc = (data: RowDataT): string =>
    data.hasOwnProperty('id') ? data['id'] : String(data);
}