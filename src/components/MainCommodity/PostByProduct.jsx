import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchPostedProducts } from "../../services/MainCommodity";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PostByProduct() {
  const [offerData, setOfferData] = useState(null);

  useEffect(() => {
    async function getData() {
      try {
        const data = await fetchPostedProducts();

        const processedData = {
          labels: [],
          datasets: [
            {
              label: "Total Offers",
              data: [], // Offer counts will be stored here
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 206, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
                "rgba(153, 102, 255, 0.8)",
                "rgba(255, 159, 64, 0.8)",
                "rgba(99, 255, 132, 0.8)",
                "rgba(255, 99, 255, 0.8)",
                "rgba(54, 235, 235, 0.8)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(99, 255, 132, 1)",
                "rgba(255, 99, 255, 1)",
                "rgba(54, 235, 235, 1)",
              ],
              borderWidth: 1,
            },
          ],
        };

        // Loop through the fetched data and populate processedData
        Object.values(data).forEach((category) => {
          category.total.forEach((offer) => {
            const productName = offer.product_name; // Assuming each offer has a product_name field
            if (productName) {
              processedData.labels.push(productName); // Add product name to labels
              processedData.datasets[0].data.push(1); // Count each offer as 1
            }
          });
        });

        // Optionally aggregate counts by product name if you have multiple offers with the same name
        const uniqueData = processedData.labels.reduce(
          (acc, productName, index) => {
            acc[productName] =
              (acc[productName] || 0) + processedData.datasets[0].data[index];
            return acc;
          },
          {}
        );

        // Convert uniqueData to an array and sort by offer count in descending order
        const sortedData = Object.entries(uniqueData)
          .map(([productName, count]) => ({ productName, count }))
          .sort((a, b) => b.count - a.count); // Sort in descending order

        // Rebuild processedData with sorted labels and data
        processedData.labels = sortedData.map((item) => item.productName);
        processedData.datasets[0].data = sortedData.map((item) => item.count);

        setOfferData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    getData();
  }, []);

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Total Offers by Product Name",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Product Names",
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
      <h2>Offers By Product</h2>
      <div style={{ height: "300px", width: "100%" }}>
        {offerData ? (
          <Bar
            data={offerData}
            options={{
              ...options,
              maintainAspectRatio: false, // Allow the chart to resize freely
              responsive: true, // Ensure the chart is responsive
            }}
          />
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
}

export default PostByProduct;
