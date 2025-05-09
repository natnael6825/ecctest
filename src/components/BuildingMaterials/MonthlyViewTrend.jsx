import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchAllInteraction } from "../../services/BuildingMaterials";
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
        const data = await fetchAllInteraction();

        const interactions = Array.isArray(data)
          ? data
          : data.interactions || [];

        const calculateInteractions = (isMonthly = true) => {
          const interactionCounts = {};

          interactions.forEach((interaction) => {
            const interactionDate = new Date(interaction.createdAt);
            const label = isMonthly
              ? interactionDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })
              : interactionDate.toISOString().split("T")[0];

            interactionCounts[label] = (interactionCounts[label] || 0) + 1;
          });

          const sortedLabels = Object.keys(interactionCounts).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          const sortedData = sortedLabels.map(
            (label) => interactionCounts[label]
          );

          return { sortedLabels, sortedData };
        };

        const { sortedLabels, sortedData } =
          viewType === "Month"
            ? calculateInteractions(true)
            : calculateInteractions(false);

        setLabels(sortedLabels);
        setInteractionData(sortedData);

        if (sortedLabels.length > 1) {
          setRange([0, sortedLabels.length - 1]);
        }
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
      tooltip: {
        enabled: true,
      },
      legend: {
        display: false,
      },
      datalabels:
        viewType === "Month"
          ? {
              display: true,
              formatter: (value) => value.toFixed(2),
              color: "black",
              anchor: "end",
              align: "top",
              font: { weight: "bold" },
            }
          : { display: false },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  return (
    <div>
      <h2>{viewType === "Month" ? "Monthly" : "Daily"} Interaction Growth</h2>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="viewType" style={{ marginRight: "10px" }}>
          View by:
        </label>
        <select
          id="viewType"
          value={viewType}
          onChange={(e) => setViewType(e.target.value)}
          style={{
            padding: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="Month">Monthly View</option>
          <option value="Day">Daily View</option>
        </select>
      </div>

      <div style={{ height: "300px", position: "relative" }}>
        <Line data={chartData} options={options} />
      </div>

      {labels.length > 1 && ( // Only render Range if there are at least two labels
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
                  height: "8px",
                  width: "100%",
                  backgroundColor: "#ddd",
                  borderRadius: "8px",
                  position: "relative",
                }}
              >
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
                  }}
                >
                  {labels[range[index]]}
                </div>
              </div>
            )}
          />
        </div>
      )}

      {labels.length > 1 && (
        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
          Showing data from: {filteredLabels[0]} to{" "}
          {filteredLabels[filteredLabels.length - 1]}
        </div>
      )}
    </div>
  );
}

export default MonthlyViewTrend;
