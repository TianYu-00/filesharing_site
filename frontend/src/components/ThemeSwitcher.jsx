import React from "react";
import { TbSun, TbMoon } from "react-icons/tb";

function ThemeSwitcher({ isToggled, toggleSwitch }) {
  return (
    <div className="flex w-full h-full">
      <button onClick={toggleSwitch}>
        {isToggled ? <TbSun className="text-black" size={25} /> : <TbMoon className="text-white" size={25} />}
      </button>
    </div>
  );
}

export default ThemeSwitcher;
