export enum WIDGET_TYPES {
    BAR_CHART = 'bar_chart',
    LINE_CHART = 'line_chart',
    PIE_CHART = 'pie_chart',
    TABLE = 'table',
}

export enum WidgetDataValueType {
    STRING = 'STRING',
    DECIMAL = 'DECIMAL',
    NUMBER = 'NUMBER',
    BIGINT = 'BIGINT',
    DOUBLE = 'DOUBLE',
    BOOLEAN = 'BOOLEAN',
    FLOAT = 'FLOAT',
    SMALLINT = 'SMALLINT',
    TINYINT = 'TINYINT',
    INT = 'INT',
    DATE = 'DATE',
    TIMESTAMP = 'TIMESTAMP',
    TIME = 'TIME',
    DATETIME = 'DATETIME',
}

export enum WidgetTypes {
    BAR_CHART = 'bar_chart',
    LINE_CHART = 'line_chart',
    AREA_CHART = 'area_chart',
    PIE_CHART = 'pie_chart',
    DONUT_CHART = 'donut_chart',
    KPI = 'kpi',
    TABLE = 'table',
    PIVOT_TABLE = 'pivot_table',
}

export const AG_CHART_TYPES = {
    [WidgetTypes.BAR_CHART]: 'bar',
    [WidgetTypes.LINE_CHART]: 'line',
    [WidgetTypes.AREA_CHART]: 'area',
    [WidgetTypes.PIE_CHART]: 'pie',
    [WidgetTypes.DONUT_CHART]: 'donut',
}
