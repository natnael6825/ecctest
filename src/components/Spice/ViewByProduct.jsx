import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchAllProductInteractionCounts } from "../../services/Spice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ViewByProduct() {
  const [interactionData, setInteractionData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInteractionData = async () => {
      try {
        // Fetch product interaction counts for all categories
        const allProductCounts = await fetchAllProductInteractionCounts();

        // Combine and sort the results for chart display
        const combinedProductCounts = combineProductCounts(allProductCounts);
        const sortedProductCounts = sortAndFilterProductCounts(
          combinedProductCounts
        );

        setInteractionData(sortedProductCounts);
      } catch (error) {
        console.error("Error fetching interaction data:", error);
      } finally {
        setLoading(false);
      }
    };

    getInteractionData();
  }, []);

  // Combine interaction counts from different categories
  const combineProductCounts = (allProductCounts) => {
    const productCounts = {};
    Object.values(allProductCounts).forEach((counts) => {
      counts.forEach(({ product_name, interactionCount }) => {
        if (product_name) {
          productCounts[product_name] =
            (productCounts[product_name] || 0) + interactionCount;
        }
      });
    });
    return productCounts;
  };

  // Filter and sort product counts
  const sortAndFilterProductCounts = (productCounts) => {
    const sortedCounts = Object.entries(productCounts)
      .filter(([_, interactionCount]) => interactionCount > 0)
      .sort((a, b) => b[1] - a[1]);
    return Object.fromEntries(sortedCounts);
  };

  const chartData = {
    labels: Object.keys(interactionData),
    datasets: [
      {
        label: "Interactions",
        data: Object.values(interactionData),
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Number of Interactions by Product",
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default ViewByProduct;
