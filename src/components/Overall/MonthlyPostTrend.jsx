

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchPostedProducts } from "../../services/InteractionAndOffer";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const generateColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor}`;
};

function MonthlyTrend() {
  const [buyData, setBuyData] = useState({});
  const [sellData, setSellData] = useState({});
  const [totalData, setTotalData] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("Total");
  const [colors, setColors] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("Month"); // State for dropdown selection
  const [range, setRange] = useState([0, 0]);

  useEffect(() => {
    async function getData() {
      try {
        const data = await fetchPostedProducts();
        const buyOffersByDate = {};
        const sellOffersByDate = {};
        const totalOffersByDate = {};
        const productColors = {};
        const allDates = new Set();

        Object.keys(data).forEach((category) => {
          ["buy", "sell"].forEach((offerType) => {
            const offers = data[category]?.[offerType];

            if (offers) {
              offers.forEach((offer) => {
                const offerDate = new Date(offer.createdAt);
                const dateString =
                  viewType === "Month"
                    ? `${offerDate.toLocaleString("default", {
                        month: "long",
                      })} ${offerDate.getFullYear()}`
                    : offerDate.toISOString().split("T")[0];

                const productName = offer.product_name;

                allDates.add(dateString);

                if (!buyOffersByDate[productName]) {
                  buyOffersByDate[productName] = {};
                  sellOffersByDate[productName] = {};
                  totalOffersByDate[productName] = {};
                  productColors[productName] = generateColor();
                }

                if (offerType === "buy") {
                  buyOffersByDate[productName][dateString] =
                    (buyOffersByDate[productName][dateString] || 0) + 1;
                } else if (offerType === "sell") {
                  sellOffersByDate[productName][dateString] =
                    (sellOffersByDate[productName][dateString] || 0) + 1;
                }

                totalOffersByDate[productName][dateString] =
                  (totalOffersByDate[productName][dateString] || 0) + 1;
              });
            }
          });
        });

        const sortedDates = Array.from(allDates).sort(
          (a, b) => new Date(a) - new Date(b)
        );

        buyOffersByDate["Total"] = {};
        sellOffersByDate["Total"] = {};
        totalOffersByDate["Total"] = {};

        sortedDates.forEach((date) => {
          buyOffersByDate["Total"][date] = Object.keys(buyOffersByDate)
            .filter((key) => key !== "Total")
            .reduce(
              (sum, productName) =>
                sum + (buyOffersByDate[productName][date] || 0),
              0
            );

          sellOffersByDate["Total"][date] = Object.keys(sellOffersByDate)
            .filter((key) => key !== "Total")
            .reduce(
              (sum, productName) =>
                sum + (sellOffersByDate[productName][date] || 0),
              0
            );

          totalOffersByDate["Total"][date] =
            buyOffersByDate["Total"][date] + sellOffersByDate["Total"][date];
        });

        productColors["Total"] = "#0000FF";

        setBuyData(buyOffersByDate);
        setSellData(sellOffersByDate);
        setTotalData(totalOffersByDate);
        setDates(sortedDates);
        setColors(productColors);
        setRange([0, sortedDates.length - 1]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [viewType]);

  const handleProductClick = (productName) => {
    setSelectedProduct(productName);
  };

  const handleRangeChange = (values) => {
    setRange(values);
  };

  const filteredDates = dates.slice(range[0], range[1] + 1);
  // const chartData = {
  //   labels: filteredDates,
  //   datasets: [
  //     {
  //       label: "Buy Offers",
  //       data: filteredDates.map(
  //         (date) => buyData[selectedProduct]?.[date] || 0
  //       ),
  //       borderColor: viewType === "Month" ? "green" : "rgba(0,0,0,0)",
  //       backgroundColor:
  //         viewType === "Month" ? "rgba(0, 128, 0, 0.2)" : "rgba(0,0,0,0)",
  //       borderWidth: 2,
  //     },
  //     {
  //       label: "Sell Offers",
  //       data: filteredDates.map(
  //         (date) => sellData[selectedProduct]?.[date] || 0
  //       ),
  //       borderColor: viewType === "Month" ? "red" : "rgba(0,0,0,0)",
  //       backgroundColor:
  //         viewType === "Month" ? "rgba(255, 0, 0, 0.2)" : "rgba(0,0,0,0)",
  //       borderWidth: 2,
  //     },
  //     {
  //       label: "Total Offers",
  //       data: filteredDates.map(
  //         (date) => totalData[selectedProduct]?.[date] || 0
  //       ),
  //       borderColor: viewType === "Month" ? "blue" : "rgba(0,0,0,0)",
  //       backgroundColor:
  //         viewType === "Month" ? "rgba(0, 0, 255, 0.2)" : "rgba(0,0,0,0)",
  //       borderWidth: 2,
  //     },
  //   ],
  // };
  const chartData = {
    labels: filteredDates,
    datasets: [
      {
        label: "Buy Offers",
        data: filteredDates.map(
          (date) => buyData[selectedProduct]?.[date] || 0
        ),
        borderColor: "green",
        backgroundColor: "rgba(0, 128, 0, 0.2)",
        borderWidth: 2,
        tension: 0.4,  // Add this line to curve the line
        hidden:
          viewType === "Day" &&
          !filteredDates.some((date) => buyData[selectedProduct]?.[date]),
      },
      {
        label: "Sell Offers",
        data: filteredDates.map(
          (date) => sellData[selectedProduct]?.[date] || 0
        ),
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        borderWidth: 2,
        tension: 0.4,  // Add this line to curve the line
        hidden:
          viewType === "Day" &&
          !filteredDates.some((date) => sellData[selectedProduct]?.[date]),
      },
      {
        label: "Total Offers",
        data: filteredDates.map(
          (date) => totalData[selectedProduct]?.[date] || 0
        ),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        borderWidth: 2,
        tension: 0.4,  // Add this line to curve the line
        hidden:
          viewType === "Day" &&
          !filteredDates.some((date) => totalData[selectedProduct]?.[date]),
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
          text: "Number of Offers",
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>
        {selectedProduct === "Total"
          ? "Total Offers Trend"
          : `${selectedProduct} Offers Trend`}
      </h2>

      {/* Dropdown to select Month or Day view */}
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

      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}>
        {Object.keys(buyData).map((productName) => (
          <button
            key={productName}
            onClick={() => handleProductClick(productName)}
            style={{
              backgroundColor: "transparent",
              color: "black",
              padding: "5px 10px",
              margin: "5px",
              border: `1px solid ${colors[productName]}`,
              cursor: "pointer",
              borderRadius: "5px",
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

export default MonthlyTrend;
