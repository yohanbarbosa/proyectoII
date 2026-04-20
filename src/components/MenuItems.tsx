import { Icon } from "@iconify/react";
import { useState } from "react";

type Props = {
  items: string[];
};

function menuItems({ items }: Props) {
  const [active, setActive] = useState(false);

  const handleMenu = () => {
    setActive((prev) => !prev);
  };
  return (
    <div>
      {/* Item principal */}

      <div
        onClick={handleMenu}
        className="flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md select-none"
      >
        <span className="flex items-center gap-2">
          <Icon
            icon="mdi:cart-outline"
            width="18"
            height="18"
            className="text-gray-700"
          />
          <span className="font-semibold text-sm text-gray-800">Orders</span>
        </span>
        {active ? (
          <Icon
            icon="mdi:chevron-down"
            width="16"
            height="16"
            className="text-gray-500"
          />
        ) : (
          <Icon
            icon="mdi:chevron-up"
            width="16"
            height="16"
            className="text-gray-500"
          />
        )}
      </div>

      {/* Submenu */}
      {active ? (
        <ul className="mt-1 ml-5 relative space-y-0">
          {/* Línea vertical */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />

          {items.map((item: string) => (
            <li key={item} className="relative flex items-center select-none">
              {/* Línea horizontal hacia el item */}
              <div className="w-3 h-0.5 bg-gray-200 shrink-0" />
              <span className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-r-md cursor-pointer flex-1">
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        ""
      )}
    </div>
  );
}

export default menuItems;
