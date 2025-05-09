import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  fetchPostedProducts,
  fetchAllProductInteractionCounts,
} from "../../services/BuildingMaterials";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PostViewRatioByProduct() {
  const [ratioData, setRatioData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch posts and views data
        const postedProducts = await fetchPostedProducts();
        const interactionCounts = await fetchAllProductInteractionCounts();
        // Process post data
        const postCounts = {};
        Object.values(postedProducts).forEach((category) => {
          category.total.forEach((offer) => {
            const productName = offer.product_name;
            if (productName) {
              postCounts[productName] = (postCounts[productName] || 0) + 1;
            }
          });
        });

        // Process view data
        const viewCounts = {};
        Object.values(interactionCounts).forEach((counts) => {
          counts.forEach(({ product_name, interactionCount }) => {
            if (product_name) {
              viewCounts[product_name] =
                (viewCounts[product_name] || 0) + interactionCount;
            }
          });
        });

        // Compute post-to-view ratio
        const ratioData = Object.keys(postCounts).map((productName) => {
          const postCount = postCounts[productName] || 0;
          const viewCount = viewCounts[productName] || 0;
          const ratio = viewCount !== 0 ? viewCount / postCount : 0; // Avoid divide by zero
          return { productName, ratio };
        });

        // Sort by ratio (optional, if you want to sort products by ratio)
        const sortedRatioData = ratioData.sort((a, b) => b.ratio - a.ratio);

        // Prepare data for chart.js
        const chartData = {
          labels: sortedRatioData.map((item) => item.productName),
          datasets: [
            {
              label: "View-to-Post Ratio",
              data: sortedRatioData.map((item) => item.ratio),
              backgroundColor: "rgba(75, 192, 192, 0.8)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        };

        setRatioData(chartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "View-to-Post Ratio by Product",
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
          text: "View-to-Post Ratio",
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
    <div style={{ height: "300px", position: "relative" }}>
      {ratioData ? <Bar data={ratioData} options={options} /> : "Loading..."}
    </div>
  );
}

export default PostViewRatioByProduct;
