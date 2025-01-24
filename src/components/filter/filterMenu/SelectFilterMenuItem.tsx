import { useEffect, useMemo, useRef, useState } from "react"
import { ICON_SPRITE_TYPES } from "constants/icons"
import { POSITION_TYPES } from "types/common/components"
import { cn } from "utils/common"
import Input from "components/common/input"
import { FilterConfigType } from 'components/filter/filter.types'

interface SelectFilterMenuItemProps {
    menuRef: React.RefObject<HTMLDivElement>
    isOpen: boolean
    getMenuPlacement: () => string
    filtersConfig: FilterConfigType[]
    onAddFilter: (filter: string) => void
    currentPageFilters: string[]
}

const SelectFilterMenuItem = ({ menuRef, isOpen, getMenuPlacement, filtersConfig, onAddFilter, currentPageFilters }: SelectFilterMenuItemProps) => {
    const checkIfFilterIsSelected = (filterKey: string) => currentPageFilters?.includes(filterKey);
    const [search, setSearch] = useState('')
    const [menuWidth, setMenuWidth] = useState(0)
    const searchRef = useRef<HTMLInputElement>(null)
    const filteredMenuItems = useMemo(() => filtersConfig?.filter((filter) => filter?.key?.includes(search)), [filtersConfig, search])

    useEffect(() => {
        if (isOpen) {
            if (menuRef?.current) setMenuWidth(menuRef.current.offsetWidth)
            searchRef.current?.focus()
            menuRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }
        else {
            setSearch('')
        }
    }, [isOpen])

    return <div
        ref={menuRef}
        style={{ minWidth: menuWidth }}
        className={cn(
            `absolute top-full min-w-[300px] left-0 mt-1 px-2.5 z-1000 shadow-tableFilterMenu border transition-all duration-200 bg-white rounded-md`,
            isOpen ? 'max-h-[500px] overflow-auto' : 'max-h-0 overflow-hidden border-0',
            getMenuPlacement() === POSITION_TYPES.LEFT ? '-right-full -translate-x-full' : ''
        )}
    >
        <Input
            autoFocus
            inputRef={searchRef}
            placeholder='Search...'
            className="pt-2.5 sticky top-0 bg-white"
            inputClassName=' border-none w-full focus:outline-none focus:border-none focus:shadow-none'
            value={search}
            trailingIconProps={search ? {
                id: 'x',
                iconCategory: ICON_SPRITE_TYPES.GENERAL,
                onClick: () => setSearch('')
            } : undefined}
            onChange={(e) => {
                if (e?.target?.value !== undefined) {
                    setSearch(e.target.value);
                }
            }}
        />
        {filteredMenuItems?.length > 0 ? filteredMenuItems?.map((filter, index) => (
            <div
                key={index}
                data-testid={`filter-menu-item-${filter?.key}`}
                className={cn(
                    ` flex p-2 items-center rounded w-full`,
                    checkIfFilterIsSelected(filter?.key) ? ' cursor-default opacity-30' : 'cursor-pointer hover:bg-GRAY_70'
                )}
                onClick={() => !checkIfFilterIsSelected(filter?.key) && onAddFilter(filter?.key)}
            >
                <div className='f-12-400 text-GRAY_1000'>{filter.key}</div>
            </div>
        )) : <div className='flex justify-center items-center p-2 f-14-400 text-GRAY_1000'>No results found</div>}
    </div>
}

export default SelectFilterMenuItem