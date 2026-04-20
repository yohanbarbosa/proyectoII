import { Icon } from "@iconify/react";
import MenuItems from "./MenuItems";

function sidebar() {
  return (
    <div className="bg-[#f6f6f6] w-1/5 h-screen p-4">
      <div className=" flex ">
        <Icon
          icon="mdi:flag-variant-outline"
          width="24"
          height="24"
          color="blue"
        />
        <span>Proyecto</span>
      </div>
      <div className="mt-10">
        <ul className=" space-y-2">
          <li className="flex items-center  px-3 py-2 bg-gray-100 hover:bg-gray-200  rounded-md">
            <Icon
              icon="mdi:view-dashboard"
              width="18"
              height="18"
              className="text-gray-700"
            />
            <span className="ml-2 font-semibold text-sm text-gray-800">
              Dashboard
            </span>
          </li>

          <li className="flex items-center  px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            <Icon
              icon="mdi:package-variant-closed"
              width="18"
              height="18"
              className="text-gray-700"
            />
            <span className="ml-2 font-semibold text-sm text-gray-800">
              Products
            </span>
          </li>
          <li>
            <MenuItems items={["All Orders", "Returns", "Order Tracking"]} />
          </li>
          <li className="flex items-center  px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            <Icon
              icon="mdi:attach-money"
              width="18"
              height="18"
              className="text-gray-700"
            />
            <span className="ml-2 font-semibold text-sm text-gray-800">
              Sales
            </span>
          </li>
          <li className="flex items-center  px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            <Icon
              icon="mdi:users"
              width="18"
              height="18"
              className="text-gray-700"
            />
            <span className="ml-2 font-semibold text-sm text-gray-800">
              Customers
            </span>
          </li>
          <li className="flex items-center  px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            <Icon
              icon="mdi:file-report-outline"
              width="18"
              height="18"
              className="text-gray-700"
            />
            <span className="ml-2 font-semibold text-sm text-gray-800">
              Reports
            </span>
          </li>
          
        </ul>
      </div>
    </div>
  );
}

export default sidebar;
