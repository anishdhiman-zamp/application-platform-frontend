import React, { useMemo } from "react";
import { ClientSideRowModelModule, ColDef, DateFilterModule, ModuleRegistry, NumberFilterModule, TextFilterModule, ValidationModule } from "ag-grid-community";
import { ColumnMenuModule, ContextMenuModule, MultiFilterModule, SetFilterModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { MapAny } from "types/commonTypes";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    MultiFilterModule,
    SetFilterModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    ValidationModule /* Development Only */,
]);

interface TableProps {
    rows: MapAny[];
    columns: MapAny[];
    columnConfig?: MapAny;
    containerStyle?: MapAny;
    gridStyle?: MapAny;
}

const Table: React.FC<TableProps> = ({ rows, columns, columnConfig, containerStyle = { width: "100%", height: "100%" }, gridStyle = { height: "100%", width: "100%" } }) => {

    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 150,
            filter: "agTextColumnFilter",
            suppressHeaderMenuButton: true,
            suppressHeaderContextMenu: true,
            floatingFilter: false,
            ...columnConfig,
        };
    }, [columnConfig]);

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact
                    rowData={rows}
                    columnDefs={columns}
                    defaultColDef={defaultColDef}
                />
            </div>
        </div>
    );
};

export default Table;
