import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchAllInteraction } from "../../services/InteractionAndOffer";
import { Range } from "react-range";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MonthlyViewTrend() {
  const [interactionData, setInteractionData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [viewType, setViewType] = useState("Month");
  const [range, setRange] = useState([0, 0]);

  useEffect(() => {
    async function getData() {
      try {
        const fetchedData = await fetchAllInteraction();

        // Calculate Monthly Interactions
        const calculateMonthlyInteractions = () => {
          const monthlyCounts = {};
          fetchedData.forEach((interaction) => {
            const interactionDate = new Date(interaction.createdAt);
            const monthYear = interactionDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            });
            monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
          });
          const sortedMonths = Object.keys(monthlyCounts).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          const sortedCounts = sortedMonths.map(
            (monthYear) => monthlyCounts[monthYear]
          );
          return { labels: sortedMonths, data: sortedCounts };
        };

        // Calculate All Daily Interactions
        const calculateAllDailyInteractions = () => {
          const dailyCounts = {};
          fetchedData.forEach((interaction) => {
            const interactionDate = new Date(interaction.createdAt)
              .toISOString()
              .split("T")[0];
            dailyCounts[interactionDate] =
              (dailyCounts[interactionDate] || 0) + 1;
          });

          const sortedDates = Object.keys(dailyCounts).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          const sortedCounts = sortedDates.map((date) => dailyCounts[date]);

          return { labels: sortedDates, data: sortedCounts };
        };

        // Set Data Based on View Type
        const { labels, data } =
          viewType === "Month"
            ? calculateMonthlyInteractions()
            : calculateAllDailyInteractions();

        setLabels(labels);
        setInteractionData(data);
        setRange([0, labels.length - 1]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    getData();
  }, [viewType]);

  const handleRangeChange = (values) => {
    setRange(values);
  };

  const filteredLabels = labels.slice(range[0], range[1] + 1);
  const filteredData = interactionData.slice(range[0], range[1] + 1);

  const chartData = {
    labels: filteredLabels,
    datasets: [
      {
        label: "Interactions",
        data: filteredData,
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: viewType === "Month" ? "Months" : "Days",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Interactions",
        },
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      datalabels:
        viewType === "Month"
          ? {
              anchor: "end",
              align: "end",
              formatter: (value) => value.toFixed(2),
              color: "#000",
              font: {
                weight: "bold",
              },
            }
          : null,
    },
  };

  return (
    <div>
      <h2>{viewType}ly Interaction Growth</h2>
      <select
        value={viewType}
        onChange={(e) => setViewType(e.target.value)}
        style={{ marginBottom: "20px" }}
      >
        <option value="Month">Monthly View</option>
        <option value="Day">Daily View</option>
      </select>

      <div style={{ height: "300px", position: "relative" }}>
        <Line data={chartData} options={options} />
      </div>

      {labels.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Range
            values={range}
            step={1}
            min={0}
            max={labels.length - 1}
            onChange={handleRangeChange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "10px",
                  width: "100%",
                  backgroundColor: "#ddd",
                  borderRadius: "8px",
                  marginTop: "20px",
                  position: "relative",
                }}
              >
                {/* Track Fill */}
                <div
                  style={{
                    position: "absolute",
                    height: "100%",
                    backgroundColor: "#4A90E2",
                    borderRadius: "8px",
                    left: `${(range[0] / (labels.length - 1)) * 100}%`,
                    width: `${
                      ((range[1] - range[0]) / (labels.length - 1)) * 100
                    }%`,
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props, index }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "20px",
                  width: "20px",
                  backgroundColor: "#4A90E2",
                  borderRadius: "4px",
                  boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-28px",
                    color: "#4A90E2",
                    fontSize: "12px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  {labels[range[index]]}
                </div>
              </div>
            )}
          />
        </div>
      )}

      <div style={{ marginTop: "10px", fontWeight: "bold" }}>
        Showing data from: {filteredLabels[0]} to{" "}
        {filteredLabels[filteredLabels.length - 1]}
      </div>
    </div>
  );
}

export default MonthlyViewTrend;
