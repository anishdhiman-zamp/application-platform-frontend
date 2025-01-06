import React, { useState } from "react";
import { ICON_SPRITE_TYPES } from "constants/icons";
import { SIZE_TYPES } from "types/common/components";
import Input from "components/common/organisms/input";
import SvgSpriteLoader from "components/SvgSpriteLoader";

const Topbar = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="h-12 p-2.5 flex items-center justify-between">Topbar
      <Input placeholder="Search" value={search} size={SIZE_TYPES.SMALL} className="hidden" onChange={(e) => { setSearch(e.target.value) }} />
      <div className="flex items-center gap-2 f-13-500">
        Share
        <SvgSpriteLoader id="dots-vertical" iconCategory={ICON_SPRITE_TYPES.GENERAL} height={16} width={16} />
      </div>
    </div>);
};

export default Topbar;
