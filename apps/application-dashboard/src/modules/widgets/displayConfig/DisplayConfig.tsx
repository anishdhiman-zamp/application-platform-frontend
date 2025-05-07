import {
  DISPLAY_CONFIG_RULES,
  DisplayConfigRulesConditionsAliasType,
  DisplayConfigRulesConditionsType,
  GetCellStyleParamsType,
} from 'modules/widgets/displayConfig/displayConfig.types';
import {
  checkPeriodBasedDateColumnToHide,
  compareColumnGroupAliasDate,
  evaluateOperator,
  handleExtractPartsFromColId,
  handleMatchRecursiveParentKey,
  updateColumnsToHideForDisplayConfig,
} from 'modules/widgets/displayConfig/displayConfig.utils';
import { MapAny } from 'types/commonTypes';

export const getCellStyle = (params: GetCellStyleParamsType) => {
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
    colGroupHeaderName,
  } = params;

  const rules: { type: DISPLAY_CONFIG_RULES; conditions: DisplayConfigRulesConditionsType }[] =
    (displayConfigStyle &&
      (displayConfigStyle[cellType]?.rules as {
        type: DISPLAY_CONFIG_RULES;
        conditions: DisplayConfigRulesConditionsType;
      }[])) ||
    [];
  let style: MapAny = {};

  rules.forEach((rule: { type: DISPLAY_CONFIG_RULES; conditions: DisplayConfigRulesConditionsType }) => {
    switch (rule.type as DISPLAY_CONFIG_RULES) {
      case DISPLAY_CONFIG_RULES.LEVEL:
        rule?.conditions?.forEach((condition) => {
          if ((!condition?.value || condition?.value === value) && level === condition?.level) {
            const styledIndex = (childIndex ?? 0) % (condition?.alternate_cell_number ?? 1);
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
            compareColumnGroupAliasDate(columnGroupId ?? '', column_group_id ?? '', operator ?? '');

          const handleAliasString = () => {
            // Case 1: Only ref is provided
            if (ref && !row_group_field && !column_group_id) {
              return evaluateOperator(rowParentFieldGreaterByOne ?? '', ref, operator ?? '');
            }

            // Case 2: column_group_id & ref, no row_group_field
            if (column_group_id && ref && !row_group_field) {
              return (
                column_group_id === column?.parent?.groupId &&
                handleMatchRecursiveParentKey(level ?? null, ref, node ?? {})
              );
            }

            // Case 3: column_group_id present but no ref/row_group_field
            if (column_group_id && !ref && !row_group_field) {
              return evaluateOperator(columnGroupId ?? '', column_group_id, operator ?? '');
            }

            // Case 4: row_group_field & ref, no column_group_id
            if (row_group_field && ref && !column_group_id) {
              return (
                rowGroupField === row_group_field &&
                (handleMatchRecursiveParentKey(level ?? null, ref, node ?? {}) || ref === 'all')
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
          const { alias, column_id = [], period, header_name, operator, toggle_field } = condition;
          const isDateAlias = alias === DisplayConfigRulesConditionsAliasType.DATE;
          const colIds = [...(column_id || [])];
          const { date } = handleExtractPartsFromColId(column?.colId);

          // Check for period-based hiding without toggle_field
          if (
            !toggle_field &&
            isDateAlias &&
            period &&
            checkPeriodBasedDateColumnToHide({
              period,
              colGroupHeaderName,
              headerName: header_name,
              date: date?.[0],
            })
          ) {
            updateColumnsToHideForDisplayConfig(setAllPivotColumnsToHide, currentWidgetInstanceId ?? '', [
              { colId: columnId ?? '', hide: true },
            ]);

            return;
          }

          // Evaluate if columnId should be hidden
          const shouldHide =
            colIds.length > 0 &&
            colIds.some((id) => {
              switch (alias) {
                case DisplayConfigRulesConditionsAliasType.DATE:
                  return compareColumnGroupAliasDate(id, columnId ?? '', operator ?? '');
                case DisplayConfigRulesConditionsAliasType.STRING:
                default:
                  return evaluateOperator(id, columnId ?? '', operator ?? '');
              }
            });

          if (currentWidgetInstanceId && shouldHide) {
            const newColIds = colIds.map((id) => ({ colId: id, hide: true }));

            updateColumnsToHideForDisplayConfig(setAllPivotColumnsToHide, currentWidgetInstanceId, newColIds);
          }
        });
        break;

      default:
        break;
    }
  });

  return style;
};
