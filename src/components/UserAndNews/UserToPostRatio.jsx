import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { fetchPostedProducts } from "../../services/InteractionAndOffer";
import { getAllUsers } from "../../services/UserEngagementServ";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register necessary chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

function UserToPostRatio() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postedProducts = await fetchPostedProducts();
        const users = await getAllUsers();

        // Collect all unique chat IDs who posted offers
        const usersWithOffers = new Set();
        Object.values(postedProducts).forEach((category) => {
          category.total.forEach((offer) => {
            usersWithOffers.add(offer.chat_id); // Using chat_id to identify users
          });
        });

        // Calculate counts
        const usersWithOffersCount = usersWithOffers.size;
        const usersWithoutOffersCount = users.length - usersWithOffersCount;

        // Prepare chart data
        setChartData({
          labels: ["Users with Offers", "Users without Offers"],
          datasets: [
            {
              data: [usersWithOffersCount, usersWithoutOffersCount],
              backgroundColor: ["#36A2EB", "#FF6384"], // Customize colors if desired
            },
          ],
        });
      } catch (error) {
        console.error("Error calculating user offer ratios:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ height: "400px", position: "relative" }}>
      <h3>User to Offer Ratio</h3>
      {chartData ? <Pie data={chartData} /> : <p>Loading data...</p>}
    </div>
  );
}

export default UserToPostRatio;
