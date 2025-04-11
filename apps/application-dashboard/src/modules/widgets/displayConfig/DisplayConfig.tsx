import {
  DISPLAY_CONFIG_CELL_TYPE,
  DISPLAY_CONFIG_RULES,
  DisplayConfigRulesConditionsAliasType,
  DisplayConfigRulesConditionsType,
} from 'modules/widgets/displayConfig/displayConfig.types';
import {
  compareColumnGroupAliasDate,
  evaluateOperator,
  getTodayFormattedDatePivot,
  handleExtractPartsFromColId,
  handleMatchRecursiveParentKey,
} from 'modules/widgets/displayConfig/displayConfig.utils';
import { AllPivotColumnsToHideType, ColumnsToHideType } from 'modules/widgets/Pivot/pivot.types';
import { formatColGroupHeaderDisplayName } from 'modules/widgets/Pivot/pivot.utils';
import { MapAny } from 'types/commonTypes';

export const getCellStyle = (params: MapAny) => {
  const {
    node,
    level,
    childIndex,
    column,
    value,
    rowParentFieldGreaterByOne,
    rowGroupField,
    columnId,
    columnGroupId,
    cellType,
    setAllPivotColumnsToHide,
    currentWidgetInstanceId,
    displayConfigStyle,
  } = params;

  const rules = (displayConfigStyle && displayConfigStyle[cellType as DISPLAY_CONFIG_CELL_TYPE]?.rules) || [];
  let style: MapAny = {};

  const updateColumnsToHide = (widgetInstanceId: string, newColIds: { colId: string; hide: boolean }[]) => {
    setAllPivotColumnsToHide((prev: AllPivotColumnsToHideType) => {
      const updatedConfigs = Array.isArray(prev) ? [...prev] : [];

      const existingConfigIndex = updatedConfigs?.findIndex((item) => item?.widgetInstanceId === widgetInstanceId);

      if (existingConfigIndex !== -1) {
        const existingColIds = new Set(
          updatedConfigs[existingConfigIndex]?.colIds?.map((col: ColumnsToHideType) => col?.colId),
        );

        const filteredNewColIds = newColIds?.filter((col) => !existingColIds.has(col.colId));

        if (filteredNewColIds.length > 0) {
          updatedConfigs[existingConfigIndex]?.colIds.push(...filteredNewColIds);
        }
      } else {
        updatedConfigs.push({
          widgetInstanceId,
          colIds: newColIds,
        });
      }

      return updatedConfigs;
    });
  };

  function checkPeriodBasedDateColumnToHide(
    period: string,
    value: string,
    headerName?: string,
    date?: string,
  ): boolean {
    if (period === 'TODAY') {
      return value === headerName && date !== getTodayFormattedDatePivot();
    }

    if (period === 'WEEKEND') {
      const { suffix } = formatColGroupHeaderDisplayName(date ?? '');

      return ['Sat', 'Sun'].some((day) => suffix?.includes(day));
    }

    return false;
  }

  rules.forEach((rule: { type: DISPLAY_CONFIG_RULES; conditions: DisplayConfigRulesConditionsType }) => {
    switch (rule.type as DISPLAY_CONFIG_RULES) {
      case DISPLAY_CONFIG_RULES.LEVEL:
        rule?.conditions?.forEach((condition) => {
          if ((!condition?.value || condition?.value === value) && level === condition?.level) {
            const styledIndex = childIndex % (condition?.alternate_cell_number ?? 1);
            const styleToApply = Array.isArray(condition?.style_properties)
              ? condition.style_properties[styledIndex]
              : undefined;

            if (styleToApply) {
              style = { ...style, ...styleToApply };
            }
            style = { ...style, ...condition.style_properties };
          }
        });
        break;

      case DISPLAY_CONFIG_RULES.VALUE_MATCH:
        rule?.conditions?.forEach((condition) => {
          const { alias, operator, ref, column_group_id, row_group_field } = condition || {};
          let shouldApplyStyle = false;

          const handleAliasDate = () =>
            compareColumnGroupAliasDate(columnGroupId, column_group_id ?? '', operator ?? '');

          const handleAliasString = () => {
            // Case 1: Only ref is provided
            if (ref && !row_group_field && !column_group_id) {
              return evaluateOperator(rowParentFieldGreaterByOne, ref, operator ?? '');
            }

            // Case 2: column_group_id & ref, no row_group_field
            if (column_group_id && ref && !row_group_field) {
              return column_group_id === column?.parent?.groupId && handleMatchRecursiveParentKey(level, ref, node);
            }

            // Case 3: column_group_id present but no ref/row_group_field
            if (column_group_id && !ref && !row_group_field) {
              return evaluateOperator(columnGroupId, column_group_id, operator ?? '');
            }

            // Case 4: row_group_field & ref, no column_group_id
            if (row_group_field && ref && !column_group_id) {
              return (
                rowGroupField === row_group_field && (handleMatchRecursiveParentKey(level, ref, node) || ref === 'all')
              );
            }

            return false;
          };

          switch (alias) {
            case DisplayConfigRulesConditionsAliasType.DATE:
              shouldApplyStyle = handleAliasDate();
              break;
            case DisplayConfigRulesConditionsAliasType.STRING:
              shouldApplyStyle = handleAliasString();
              break;
            default:
              shouldApplyStyle = false;
          }

          if (shouldApplyStyle) {
            style = { ...style, ...condition.style_properties };
          }
        });
        break;

      case DISPLAY_CONFIG_RULES.HIDE:
        rule?.conditions?.forEach((condition) => {
          if (!condition?.hide) return;

          const { alias, column_id = [], period, header_name, operator } = condition;
          const isDateAlias = alias === DisplayConfigRulesConditionsAliasType.DATE;
          const colIds = [...(column_id || [])];

          const { date, value } = handleExtractPartsFromColId(column?.colId);

          // Check for period-based hiding
          if (isDateAlias && period && checkPeriodBasedDateColumnToHide(period, value, header_name, date?.[0])) {
            updateColumnsToHide(currentWidgetInstanceId, [{ colId: columnId, hide: true }]);

            return;
          }

          // Evaluate if columnId should be hidden
          const shouldHide =
            colIds.length > 0 &&
            colIds.some((id) => {
              switch (alias) {
                case DisplayConfigRulesConditionsAliasType.DATE:
                  return compareColumnGroupAliasDate(id, columnId, operator ?? '');
                case DisplayConfigRulesConditionsAliasType.STRING:
                default:
                  return evaluateOperator(id, columnId, operator ?? '');
              }
            });

          if (currentWidgetInstanceId && shouldHide) {
            const newColIds = colIds.map((id) => ({ colId: id, hide: true }));

            updateColumnsToHide(currentWidgetInstanceId, newColIds);
          }
        });
        break;

      default:
        break;
    }
  });

  return style;
};
