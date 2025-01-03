import React from "react";
import { TbSun, TbMoon } from "react-icons/tb";

function ThemeSwitcher({ isToggled, toggleSwitch }) {
  return (
    <button onClick={toggleSwitch} className="p-2" aria-label="Toggle Theme">
      {isToggled ? <TbSun className="text-black" size={25} /> : <TbMoon className="text-white" size={25} />}
    </button>
  );
}

export default ThemeSwitcher;
