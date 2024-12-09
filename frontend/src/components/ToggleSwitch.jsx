const ToggleSwitch = ({ isToggled, toggleSwitch }) => {
  return (
    <div className="flex items-center space-x-4">
      <div
        onClick={toggleSwitch}
        className={`${isToggled ? "bg-blue-500" : "bg-gray-400"} relative inline-block w-12 h-6 rounded-full`}
      >
        <span
          className={`${
            isToggled ? "transform translate-x-6" : ""
          } absolute left-1 top-1 block w-4 h-4 rounded-full bg-white transition-transform duration-200 `}
        ></span>
      </div>
    </div>
  );
};

export default ToggleSwitch;
