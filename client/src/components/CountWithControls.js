import React, { useEffect, useState } from "react";

const CountWithControls = ({
  quantity,
  onIncrease,
  onDecrease,
  onChange,
  min = 1,
  max = 9999,
}) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleInputChange = (e) => {
    const val = e.target.value;

    if (val === "") {
      setInputValue("");
      return;
    }

    if (/^\d+$/.test(val)) {
      const num = parseInt(val, 10);
      if (num >= min && num <= max) {
        setInputValue(val);
      } else if (num > max) {
        setInputValue(max.toString());
      }
    }
  };

  const handleInputBlur = () => {
    if (inputValue === "" || parseInt(inputValue, 10) < min) {
      setInputValue(min.toString());
      onChange(min);
      return;
    }

    onChange(parseInt(inputValue, 10));
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  return (
    <div className="flex items-center overflow-hidden rounded-md border border-gray-300 select-none">
      <button
        type="button"
        aria-label="Giảm số lượng"
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`flex-none h-9 px-2 py-0 text-lg font-bold leading-none transition-colors duration-150 ${
          quantity <= min
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "text-gray-700 hover:bg-gray-200"
        }`}
      >
        -
      </button>

      <input
        type="text"
        aria-label="Số lượng sản phẩm"
        inputMode="numeric"
        pattern="[0-9]*"
        className="h-9 w-12 border-x border-gray-300 text-center font-semibold text-gray-900 outline-none"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
      />

      <button
        type="button"
        aria-label="Tăng số lượng"
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`flex-none h-9 px-2 py-0 text-lg font-bold leading-none transition-colors duration-150 ${
          quantity >= max
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "text-gray-700 hover:bg-gray-200"
        }`}
      >
        +
      </button>
    </div>
  );
};

export default CountWithControls;
