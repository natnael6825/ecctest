import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Range } from "react-range";
import {
  fetchPostedProducts,
  fetchAllInteraction,
} from "../../services/RootCrop";
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

const calculateMonthlyInteractions = (data, viewType) => {
  const countsByDate = {};
  data.forEach((interaction) => {
    const interactionDate = new Date(interaction.createdAt);
    const dateLabel =
      viewType === "Month"
        ? `${interactionDate.toLocaleString("default", {
            month: "long",
          })} ${interactionDate.getFullYear()}`
        : interactionDate.toISOString().split("T")[0];

    countsByDate[dateLabel] = (countsByDate[dateLabel] || 0) + 1;
  });

  const sortedDates = Object.keys(countsByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return { sortedDates, countsByDate };
};

function PostToViewRatio() {
  const [ratioData, setRatioData] = useState({
    Ratio: [],
    Views: [],
    Posts: [],
  });
  const [dates, setDates] = useState([]);
  const [viewType, setViewType] = useState("Month");
  const [range, setRange] = useState([0, 0]);
  const [displayType, setDisplayType] = useState("Ratio");

  useEffect(() => {
    async function getData() {
      const postsData = await fetchPostedProducts();
      const viewsData = await fetchAllInteraction();

      const { sortedDates, countsByDate } = calculateMonthlyInteractions(
        viewsData,
        viewType
      );

      const viewCounts = Array(sortedDates.length).fill(0);
      const postCounts = Array(sortedDates.length).fill(0);

      viewsData.forEach((interaction) => {
        const dateIndex = sortedDates.indexOf(
          viewType === "Month"
            ? new Date(interaction.createdAt).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })
            : new Date(interaction.createdAt).toISOString().split("T")[0]
        );
        if (dateIndex !== -1) viewCounts[dateIndex] += 1;
      });

      Object.keys(postsData).forEach((category) => {
        postsData[category]?.sell?.forEach((post) => {
          const dateIndex = sortedDates.indexOf(
            viewType === "Month"
              ? new Date(post.createdAt).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })
              : new Date(post.createdAt).toISOString().split("T")[0]
          );
          if (dateIndex !== -1) postCounts[dateIndex] += 1;
        });
      });

      const ratio = viewCounts.map((views, index) =>
        postCounts[index] > 0 ? views / postCounts[index] : 0
      );

      setRatioData({ Ratio: ratio, Views: viewCounts, Posts: postCounts });
      setDates(sortedDates);

      if (sortedDates.length > 1) {
        setRange([0, sortedDates.length - 1]);
      }
    }

    getData();
  }, [viewType]);

  const handleRangeChange = (values) => setRange(values);

  const filteredDates = dates.slice(range[0], range[1] + 1);
  const displayData =
    ratioData[displayType]?.slice(range[0], range[1] + 1) || [];

  const chartData = {
    labels: filteredDates,
    datasets: [
      {
        label: `${displayType} by ${viewType}`,
        data: displayData,
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
          text: `${displayType}`,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;
            return `${context.dataset.label}: ${value.toFixed(2)}`;
          },
        },
      },
      datalabels: viewType === "Month" ? {
        display: true,
        formatter: (value) => value.toFixed(2),
        color: "black",
        anchor: "end",
        align: "top",
        font: {
          weight: "bold",
        },
      } : {
        display: false, // Disable data labels in "Day" view
      },
    },
  };

  return (
    <div>
      <h2>Monthly View-to-Post Ratio</h2>

      <div style={{ marginBottom: "10px" }}>
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

      <div>
        <label htmlFor="displayType">Data Type:</label>
        <select
          id="displayType"
          value={displayType}
          onChange={(e) => setDisplayType(e.target.value)}
          style={{ padding: "5px", marginLeft: "10px", borderRadius: "4px" }}
        >
          <option value="Ratio">View-to-Post Ratio</option>
          <option value="Views">Views</option>
          <option value="Posts">Posts</option>
        </select>
      </div>

      <div style={{ height: "300px", position: "relative", marginTop: "20px" }}>
        <Line data={chartData} options={options} />
      </div>

      {dates.length > 1 && ( // Only render Range if there are at least two dates
        <div style={{ marginTop: "20px" }}>
          <Range
            values={range}
            step={1}
            min={0}
            max={dates.length - 1}
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
                    left: `${(range[0] / (dates.length - 1)) * 100}%`,
                    width: `${((range[1] - range[0]) / (dates.length - 1)) * 100}%`,
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
                  {dates[range[index]]}
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

export default PostToViewRatio;
