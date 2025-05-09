import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Range } from "react-range";
import { fetchAndProcessProducts } from "../../services/MainCommodity";
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

const generateColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor}`;
};

function QuantityTrend() {
  const [buyData, setBuyData] = useState({});
  const [sellData, setSellData] = useState({});
  const [totalData, setTotalData] = useState({});
  const [dates, setDates] = useState([]);
  const [viewType, setViewType] = useState("Month");
  const [selectedProduct, setSelectedProduct] = useState("Total");
  const [colors, setColors] = useState({});
  const [range, setRange] = useState([0, 0]);

  useEffect(() => {
    async function getData() {
      try {
        const data = await fetchAndProcessProducts();

        const calculateTrends = () => {
          const buyCounts = {};
          const sellCounts = {};
          const totalCounts = {};
          const allDates = new Set();
          const colorMap = {};

          Object.keys(data).forEach((category) => {
            ["buy", "sell"].forEach((offerType) => {
              const products = data[category]?.[offerType];
              if (products) {
                products.forEach((product) => {
                  const productDate = new Date(product.createdAt);
                  const dateLabel =
                    viewType === "Month"
                      ? productDate.toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })
                      : productDate.toISOString().split("T")[0];

                  const productName = product.product_name;
                  const quantityInQuintals = product.quantityInQuintals || 0;

                  allDates.add(dateLabel);

                  if (!buyCounts[productName]) {
                    buyCounts[productName] = {};
                    sellCounts[productName] = {};
                    totalCounts[productName] = {};
                    colorMap[productName] = generateColor();
                  }

                  if (offerType === "buy") {
                    buyCounts[productName][dateLabel] =
                      (buyCounts[productName][dateLabel] || 0) +
                      quantityInQuintals;
                  } else if (offerType === "sell") {
                    sellCounts[productName][dateLabel] =
                      (sellCounts[productName][dateLabel] || 0) +
                      quantityInQuintals;
                  }

                  totalCounts[productName][dateLabel] =
                    (totalCounts[productName][dateLabel] || 0) +
                    quantityInQuintals;
                });
              }
            });
          });

          buyCounts["Total"] = {};
          sellCounts["Total"] = {};
          totalCounts["Total"] = {};

          Array.from(allDates).forEach((date) => {
            buyCounts["Total"][date] = Object.keys(buyCounts)
              .filter((key) => key !== "Total")
              .reduce((sum, productName) => sum + (buyCounts[productName][date] || 0), 0);

            sellCounts["Total"][date] = Object.keys(sellCounts)
              .filter((key) => key !== "Total")
              .reduce((sum, productName) => sum + (sellCounts[productName][date] || 0), 0);

            totalCounts["Total"][date] = buyCounts["Total"][date] + sellCounts["Total"][date];
          });

          colorMap["Total"] = "#0000FF";

          return {
            buyCounts,
            sellCounts,
            totalCounts,
            dates: Array.from(allDates).sort((a, b) => new Date(a) - new Date(b)),
            colorMap,
          };
        };

        const { buyCounts, sellCounts, totalCounts, dates, colorMap } = calculateTrends();

        setBuyData(buyCounts);
        setSellData(sellCounts);
        setTotalData(totalCounts);
        setDates(dates);
        setColors(colorMap);
        setRange([0, dates.length - 1]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    getData();
  }, [viewType]);

  const handleRangeChange = (values) => {
    setRange(values);
  };

  const handleProductClick = (productName) => {
    setSelectedProduct(productName);
  };

  const filteredLabels = dates.slice(range[0], range[1] + 1);
  const chartData = {
    labels: filteredLabels,
    datasets: [
      {
        label: `Buy`,
        data: filteredLabels.map((date) => buyData[selectedProduct]?.[date] || 0),
        borderColor: "green",
        backgroundColor: "transparent",
        borderWidth: 2,
        fill: false, // Remove fill
        tension: 0.4,
      },
      {
        label: `Sell`,
        data: filteredLabels.map((date) => sellData[selectedProduct]?.[date] || 0),
        borderColor: "red",
        backgroundColor: "transparent",
        borderWidth: 2,
        fill: false, // Remove fill
        tension: 0.4,
      },
      {
        label: `Total`,
        data: filteredLabels.map((date) => totalData[selectedProduct]?.[date] || 0),
        borderColor: "blue",
        backgroundColor: "transparent",
        borderWidth: 2,
        fill: false, // Remove fill
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
          text: "Quantity (in Quintals)",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
      datalabels: viewType === "Month" ? {
        display: true,
        formatter: (value) => value.toFixed(2),
        color: "black",
        anchor: "end",
        align: "top",
        font: { weight: "bold" },
      } : { display: false },
    },
  };

  return (
    <div>
      <h2>
        {selectedProduct === "Total"
          ? "Total Quantity Trend (in Quintals)"
          : `${selectedProduct} Quantity Trend (in Quintals)`}
      </h2>

      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="viewType" style={{ marginRight: "10px" }}>View by:</label>
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

      <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap" }}>
        {Object.keys(buyData).map((productName) => (
          <button
            key={productName}
            onClick={() => handleProductClick(productName)}
            style={{
              backgroundColor: "transparent",
              color: "black",
              padding: "3px 6px",
              margin: "3px",
              fontSize: "12px",
              border: "1px solid",
              borderColor: colors[productName],
              cursor: "pointer",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              minWidth: "80px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                backgroundColor: colors[productName],
                marginRight: "8px",
                borderRadius: "50%",
              }}
            ></span>
            {productName}
          </button>
        ))}
      </div>

      <div style={{ height: "300px", position: "relative" }}>
        <Line data={chartData} options={options} />
      </div>

      {dates.length > 0 && (
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

export default QuantityTrend;
