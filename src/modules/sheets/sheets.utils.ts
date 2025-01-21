import { SheetFilterType } from "types/api/pagesApi.types";

export const getFormattedSheetsFiltersConfig = (filter: SheetFilterType) => {
    return {
        key: filter?.targets[0]?.column,
        label: filter?.name,
        values: filter?.options,
        type: filter?.filter_type,
        targets: filter?.targets,
        widgetsInScope: filter?.widgets_in_scope,
    }
}