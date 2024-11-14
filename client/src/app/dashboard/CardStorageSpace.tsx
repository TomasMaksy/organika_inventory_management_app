import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import numeral from "numeral";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import moment from "moment"; // For date manipulation (e.g., to calculate the last 7 days)

const CardStorageSpace = () => {
  const { data, isLoading, refetch } = useGetDashboardMetricsQuery();
  const storageData = data?.blocksAddedEver || [];

  const [totalVolume, setTotalVolume] = useState(0);
  const [volumeData, setVolumeData] = useState<
    { date: string; volume: number }[]
  >([]);
  const [changePercentage, setChangePercentage] = useState<number>(0); // State for percentage change

  useEffect(() => {
    // Function to calculate the volume of unprocessed blocks
    const calculateVolumeForToday = () => {
      if (!isLoading && storageData.length > 0) {
        // Get current date and set start of today (midnight)
        const currentDate = new Date();
        const startOfToday = new Date(currentDate);
        startOfToday.setHours(0, 0, 0, 0); // Set to midnight today

        const endOfToday = new Date(currentDate);
        endOfToday.setHours(23, 59, 59, 999); // Set to the last moment of today

        // Filter only unprocessed blocks where arrivalDate is before today
        const relevantBlocks = storageData.filter((block) => {
          const arrivalDate = new Date(block.arrivalDate);

          // Include blocks that are unprocessed (processed = false) and arrived before today
          return block.processed === false && arrivalDate < endOfToday;
        });

        // Calculate the total volume of unprocessed blocks for today
        const volumeForToday = relevantBlocks.reduce((acc, block) => {
          // Calculate the block's volume (length * height * width) - assuming all are in cm³
          const blockVolume = block.length * block.height * block.width;

          return acc + blockVolume;
        }, 0);

        setTotalVolume(volumeForToday); // Set the total volume for today
      }
    };

    // Function to get the last 7 days' volumes
    const calculateVolumeForLast7Days = () => {
      if (!isLoading && storageData.length > 0) {
        const volumePerDay: { date: string; volume: number }[] = [];

        // Calculate volumes for the last 7 days
        for (let i = 0; i < 7; i++) {
          const day = moment().subtract(i, "days");
          const startOfDay = day.startOf("day").toDate();
          const endOfDay = day.endOf("day").toDate();

          const relevantBlocks = storageData.filter((block) => {
            const arrivalDate = new Date(block.arrivalDate);
            const removalDate = block.removalDate
              ? new Date(block.removalDate)
              : null;

            // Include blocks that are arrived before the end of the day, but exclude the block that were removed after the start of the day
            return (
              // Block is still in storage or removed after the start of the day
              // Block arrived before or at the end of today
              arrivalDate <= endOfDay &&
              (removalDate === null || removalDate > startOfDay)
            );
          });

          // Calculate the volume for each block for that day
          const volumeForDay = relevantBlocks.reduce((acc, block) => {
            const blockVolume = block.length * block.height * block.width;
            return acc + blockVolume;
          }, 0);

          volumePerDay.push({
            date: day.format("YYYY-MM-DD"),
            volume: volumeForDay,
          });
        }

        setVolumeData(volumePerDay); // Set volume data for the last 7 days
      }
    };

    // Initial volume calculation
    calculateVolumeForToday();
    calculateVolumeForLast7Days();

    // Set up polling every 10 seconds
    const intervalId = setInterval(() => {
      calculateVolumeForToday();
    }, 10000); // Poll every 10 seconds

    // Cleanup polling on component unmount
    return () => clearInterval(intervalId);
  }, [isLoading]);

  useEffect(() => {
    // Calculate percentage change when volumeData and totalVolume are ready
    if (totalVolume > 0 && volumeData.length > 0) {
      const volume7DaysAgo = volumeData[volumeData.length - 1]?.volume || 0;

      // Calculate percentage change based on today's volume and volume from 7 days ago
      const percentageChange =
        volume7DaysAgo > 0
          ? ((totalVolume - volume7DaysAgo) / volume7DaysAgo) * 100
          : 0; // Avoid division by zero

      setChangePercentage(percentageChange); // Set the percentage change
    }
  }, [totalVolume, volumeData]);

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white shadow-md rounded-2xl">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Storage Overview
            </h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="mb-4 mt-7 px-7">
              <p className="text-xs text-gray-400">In Storage</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold">
                  {totalVolume
                    ? numeral(Number(totalVolume) / 1000000000).format(
                        "0.000"
                      ) + " km³"
                    : "0 m³"}
                </p>
                <p
                  className={`text-sm ${
                    changePercentage >= 0 ? "text-green-500" : "text-red-500"
                  } flex ml-3`}
                >
                  {changePercentage >= 0 ? (
                    <TrendingUp className="w-5 h-5 mr-1" />
                  ) : (
                    <TrendingDown className="w-5 h-5 mr-1" />
                  )}
                  {Math.abs(changePercentage).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* CHART */}
            <ResponsiveContainer width="100%" height={200} className="p-2">
              <AreaChart
                data={volumeData}
                margin={{ top: 0, right: 0, left: -50, bottom: 45 }}
              >
                <XAxis dataKey="date" tick={false} axisLine={false} />
                <YAxis tickLine={false} tick={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [
                    `${(value / 1000000).toFixed(3)} m³`, // Format volume in cubic meters
                  ]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                />
                <Area
                  type="linear"
                  dataKey="volume"
                  stroke="#8884d8"
                  fill="#8884d8"
                  dot={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default CardStorageSpace;
