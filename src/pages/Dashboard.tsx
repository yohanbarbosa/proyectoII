import Sidebar from "../components/Sidebar";
import { Icon } from "@iconify/react";
import RevenueChart from "../components/RevenueChart";
import DonutChart from "../components/DonutChart";
function Dashboard() {
  return (
    <>
      <div className="flex bg-[#fafafa]">
        <Sidebar />

        <div className="w-4/5">
          <header className="flex  items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-3">
              {/* <!-- Bell --> */}
              <div className="relative">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  24
                </span>
              </div>
              {/* <!-- Search --> */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search anything
                <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                  ⌘K
                </span>
              </div>
              {/* <!-- Avatar --> */}
              <div className="flex items-center gap-1.5 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5">
            {/* <!-- Stat cards --> */}
            <div className="grid grid-cols-4 gap-4 mb-5">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Icon
                      icon="mdi:package-variant-closed"
                      width="18"
                      height="18"
                      className="text-gray-700"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Total Products</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">1,525</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon
                      icon="mdi:attach-money"
                      width="18"
                      height="18"
                      className="text-blue-700"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Total Sales</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">10,892</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                    <Icon
                      icon="mdi:arrow-top-right"
                      width="18"
                      height="18"
                      className="text-green-600"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">$157,342</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                    <Icon
                      icon="mdi:arrow-bottom-right"
                      width="18"
                      height="18"
                      className="text-red-600"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">$12,453</p>
              </div>
            </div>

            {/* <!-- Charts row --> */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {/* <!-- Sales Revenue chart --> */}
              <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="mdi:graph-bar"
                      width="18"
                      height="18"
                      className="text-gray-500"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      Sales Revenue
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 mr-4">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-indigo-300 inline-block"></span>
                        One-Time Revenue
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                        Recurring Revenue
                      </span>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded-full font-medium">
                        Monthly
                      </button>
                      <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-full">
                        Quarterly
                      </button>
                      <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-full">
                        Yearly
                      </button>
                    </div>
                  </div>
                </div>
                <RevenueChart />
              </div>

              {/* <!-- Top Categories donut --> */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="mdi:trophy-variant-outline"
                      width="18"
                      height="18"
                      className="text-gray-600"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      Top Categories
                    </span>
                  </div>
                  <a
                    href="#"
                    className="text-xs text-indigo-600 font-medium hover:underline"
                  >
                    See All
                  </a>
                </div>
                {/* <!-- Donut chart --> */}
                <DonutChart />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                      Electronics
                    </span>
                    <span className="text-gray-500">$85,000</span>
                    <span className="font-semibold text-gray-700">68%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
                      Fashion
                    </span>
                    <span className="text-gray-500">$25,000</span>
                    <span className="font-semibold text-gray-700">20%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                      Health & Wellness
                    </span>
                    <span className="text-gray-500">$10,000</span>
                    <span className="font-semibold text-gray-700">8%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                      Home & Living
                    </span>
                    <span className="text-gray-500">$5,000</span>
                    <span className="font-semibold text-gray-700">4%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- Bottom row --> */}
            <div className="grid grid-cols-2 gap-4">
              {/* <!-- Recent Activity --> */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6366f1"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">
                      Recent Activity
                    </span>
                  </div>
                  <a href="#" className="text-xs text-indigo-600 font-medium">
                    See All
                  </a>
                </div>
                <div className="space-y-3">
                  {/* <!-- Activity item --> */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6366f1"
                          stroke-width="2"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Order #2048
                        </p>
                        <p className="text-[11px] text-gray-400">
                          John Doe · 12 Jan 25
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      New Order
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ef4444"
                          stroke-width="2"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Low Stock Alert
                        </p>
                        <p className="text-[11px] text-gray-400">
                          MacBook Air M2 · 10 Jan 25
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      Low Stock
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#22c55e"
                          stroke-width="2"
                        >
                          <path d="M20 12V22H4V12" />
                          <path d="M22 7H2v5h20V7z" />
                          <path d="M12 22V7" />
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Promo code "SUMMER20"
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Applied 52 times · 8 Jan 25
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Campaign
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6b7280"
                          stroke-width="2"
                        >
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          System Update
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Version 1.21 · 2 Jan 25
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-gray-500">
                      System
                    </span>
                  </div>
                </div>
              </div>

              {/* <!-- Top Products table --> */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">
                      Top Products
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2 py-1">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      Sort
                    </button>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2 py-1">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                      Filter
                    </button>
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-right pb-2 font-medium">Stocks</th>
                      <th className="text-right pb-2 font-medium">Price</th>
                      <th className="text-right pb-2 font-medium">Sales</th>
                      <th className="text-right pb-2 font-medium">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center text-white text-[9px]">
                          📱
                        </span>
                        iPhone 15 Pro
                      </td>
                      <td className="py-2 text-right text-gray-600">6,200</td>
                      <td className="py-2 text-right text-gray-600">$999.00</td>
                      <td className="py-2 text-right text-gray-600">4,800</td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        $4,795,200
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-[9px]">
                          💻
                        </span>
                        MacBook Air M2
                      </td>
                      <td className="py-2 text-right text-gray-600">1,020</td>
                      <td className="py-2 text-right text-gray-600">$1,299</td>
                      <td className="py-2 text-right text-gray-600">3,200</td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        $4,156,800
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center text-[9px]">
                          📱
                        </span>
                        Google Pixel 8
                      </td>
                      <td className="py-2 text-right text-gray-600">1,500</td>
                      <td className="py-2 text-right text-gray-600">$699.00</td>
                      <td className="py-2 text-right text-gray-600">800</td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        $559,200
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center text-[9px]">
                          👟
                        </span>
                        Nike Air Max 90
                      </td>
                      <td className="py-2 text-right text-gray-600">2,400</td>
                      <td className="py-2 text-right text-gray-600">$130.00</td>
                      <td className="py-2 text-right text-gray-600">1,800</td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        $234,000
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-[9px]">
                          🎧
                        </span>
                        Galaxy Buds Pro
                      </td>
                      <td className="py-2 text-right text-gray-600">850</td>
                      <td className="py-2 text-right text-gray-600">$199.00</td>
                      <td className="py-2 text-right text-gray-600">1,000</td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        $199,000
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
