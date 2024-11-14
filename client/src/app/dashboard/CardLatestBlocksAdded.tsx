import { useGetDashboardMetricsQuery } from "@/state/api";
import { CalendarCheck, Cuboid, PackageCheck, ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "../(components)/Rating";

const CardLatestBlocksAdded = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
            Latest Arrivals
          </h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics?.latestBlocksAdded.map((block) => (
              <div
                key={block.blockId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b"
              >
                <div className="flex items-center gap-3">
                  <button className=" rounded-full  text-blue-600 mr-2">
                    <Cuboid className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col justify-between gap-1">
                    <div className="font-bold text-gray-700 text-lg">
                      {block.blockType.blockName}
                    </div>
                    <div className="flex text-sm items-center">
                      <span className="font-bold text-blue-500 text-sm">
                        W: {block.width}
                      </span>
                      <span className="mx-2">|</span>
                      <span className="font-bold text-blue-500 text-sm">
                        H: {block.height}
                      </span>
                      <span className="mx-2">|</span>
                      <span className="font-bold text-blue-500 text-sm">
                        L: {block.length}
                      </span>
                      {/* <Rating rating={product.rating || 0} /> */}
                    </div>
                  </div>
                </div>

                <div className="text-xs flex items-center">
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                    <CalendarCheck className="w-4 h-4" />
                  </button>
                  {block.arrivalDate
                    ? `${new Date(block.arrivalDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        }
                      )} | ${new Date(block.arrivalDate).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}`
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardLatestBlocksAdded;
