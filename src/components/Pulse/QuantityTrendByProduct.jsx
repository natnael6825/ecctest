import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchAndProcessProducts } from "../../services/Pulse";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Register the data labels plugin
);

function QuantityTrendByProduct() {
  const [productData, setProductData] = useState([]);
  const [productNames, setProductNames] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        const data = await fetchAndProcessProducts();

        const calculateTotalQuantities = () => {
          const totalQuantities = {};

          Object.keys(data).forEach((category) => {
            const products = data[category]?.total;
            if (products) {
              products.forEach((product) => {
                const productName = product.product_name;
                const quantityInQuintals = product.quantityInQuintals || 0;

                // Sum the total quantities for each product
                totalQuantities[productName] =
                  (totalQuantities[productName] || 0) + quantityInQuintals;
              });
            }
          });

          return totalQuantities;
        };

        const totals = calculateTotalQuantities();

        // Convert totalQuantities to an array of objects for sorting
        const sortedProducts = Object.entries(totals)
          .map(([productName, quantity]) => ({ productName, quantity }))
          .sort((a, b) => b.quantity - a.quantity); // Sort in descending order

        setProductData(sortedProducts);
        setProductNames(sortedProducts.map((product) => product.productName));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    getData();
  }, []);

  const chartData = {
    labels: productNames, // X-axis will display the product names
    datasets: [
      {
        label: "Total Quantity (in Quintals)",
        data: productData.map((product) => product.quantity), // Corresponding total quantities
        backgroundColor: productNames.map(
          () => "#" + Math.floor(Math.random() * 16777215).toString(16)
        ), // Random color for each bar
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows height control

    scales: {
      x: {
        title: {
          display: true,
          text: "Product Name",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Quantity (in Quintals)",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      // Configure data labels
      datalabels: {
        anchor: "end",
        align: "end",
        formatter: (value) => value.toFixed(2), // Format the value to 2 decimal places
        color: "#000", // Color of the text
        font: {
          weight: "bold",
        },
      },
    },
  };

  return (
    <div>
      <h2>Total Quantity by Product</h2>
      <div style={{ height: "300px", position: "relative" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default QuantityTrendByProduct;
