import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchPostedProducts } from "../../services/GraibsAndCereals";
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

const generateColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

function MonthlyPostTrend() {
  const [chartData, setChartData] = useState(null);
  const [dates, setDates] = useState([]);
  const [viewType, setViewType] = useState("Month");
  const [range, setRange] = useState([0, 0]);
  const [productNames, setProductNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("Total");
  const [productData, setProductData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPostedProducts();
        const buyData = {};
        const sellData = {};
        const totalData = {};
        const allDates = new Set();
        const productColors = {};

        // Initialize total data for all products
        buyData["Total"] = {};
        sellData["Total"] = {};
        totalData["Total"] = {};

        Object.keys(data).forEach((category) => {
          ["buy", "sell"].forEach((offerType) => {
            const offers = data[category]?.[offerType] || [];

            offers.forEach((offer) => {
              const date = new Date(offer.createdAt);
              const label =
                viewType === "Month"
                  ? date.toLocaleString("default", {
                      month: "short",
                      year: "numeric",
                    })
                  : date.toISOString().split("T")[0];
              const productName = offer.product_name;

              allDates.add(label);

              if (!buyData[productName]) {
                buyData[productName] = {};
                sellData[productName] = {};
                totalData[productName] = {};
                productColors[productName] = generateColor();
              }

              if (offerType === "buy") {
                buyData[productName][label] =
                  (buyData[productName][label] || 0) + 1;
                buyData["Total"][label] = (buyData["Total"][label] || 0) + 1;
              } else {
                sellData[productName][label] =
                  (sellData[productName][label] || 0) + 1;
                sellData["Total"][label] = (sellData["Total"][label] || 0) + 1;
              }

              totalData[productName][label] =
                (totalData[productName][label] || 0) + 1;
              totalData["Total"][label] = (totalData["Total"][label] || 0) + 1;
            });
          });
        });

        const sortedDates = Array.from(allDates).sort(
          (a, b) => new Date(a) - new Date(b)
        );
        setDates(sortedDates);
        setRange([0, sortedDates.length - 1]);

        setProductData({ buyData, sellData, totalData });
        setProductNames([
          "Total",
          ...Object.keys(buyData).filter((name) => name !== "Total"),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [viewType]);

  const handleProductClick = (productName) => {
    setSelectedProduct(productName);
  };

  const handleRangeChange = (values) => {
    setRange(values);
  };

  const filteredDates = dates.slice(range[0], range[1] + 1);

  const filteredChartData = {
    labels: filteredDates,
    datasets: [
      {
        label: "Buy Offers",
        data: filteredDates.map(
          (date) => productData.buyData[selectedProduct]?.[date] || 0
        ),
        borderColor: "green",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: "Sell Offers",
        data: filteredDates.map(
          (date) => productData.sellData[selectedProduct]?.[date] || 0
        ),
        borderColor: "red",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: "Total Offers",
        data: filteredDates.map(
          (date) => productData.totalData[selectedProduct]?.[date] || 0
        ),
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  if (!productData || !dates.length) return <div>Loading...</div>;

  return (
    <div style={{ height: "450px", position: "relative" }}>
      <h2>Post Trend for Grains and Cereals</h2>

      {/* Product Selection */}
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}>
        {productNames.map((name) => (
          <button
            key={name}
            onClick={() => handleProductClick(name)}
            style={{
              padding: "5px 10px",
              margin: "5px",
              backgroundColor: selectedProduct === name ? "#4A90E2" : "#ddd",
              color: selectedProduct === name ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* View Type Selector */}
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

      {/* Line Chart */}
      <div style={{ height: "300px", position: "relative" }}>
        <Line
          data={filteredChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: viewType === "Month" ? "Months" : "Days",
                },
              },
              y: {
                title: { display: true, text: "Number of Offers" },
                beginAtZero: true,
              },
            },
            elements: { point: { radius: 0 } },
          }}
        />
      </div>

      {/* Date Range Selector */}
      {dates.length > 0 && (
        <div style={{ marginTop: "20px", zIndex: 10, position: "relative" }}>
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
                    width: `${
                      ((range[1] - range[0]) / (dates.length - 1)) * 100
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
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-28px",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "12px",
                    padding: "4px",
                    backgroundColor: "#4A90E2",
                    borderRadius: "4px",
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

export default MonthlyPostTrend;
