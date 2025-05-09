import React, { useEffect, useState } from "react";
import {
  fetchPostedProducts,
  fetchAllInteraction,
} from "../../services/InteractionAndOffer"; // Adjust the import path

function TopUsersTable() {
  const [topPostUsers, setTopPostUsers] = useState([]);
  const [topViewUsers, setTopViewUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const skipChatIds = [415379196]; // Add more chat_ids to skip here

  useEffect(() => {
    const getTopUsers = async () => {
      try {
        const postedProducts = await fetchPostedProducts(); // Fetch posted products
        const postCounts = countUserPosts(postedProducts); // Count posts by users
        const sortedPostUsers = await fetchUserDetails(sortUsers(postCounts)); // Fetch user details and sort
        setTopPostUsers(sortedPostUsers);

        const interactionData = await fetchAllInteraction(); // Fetch interaction data
        const viewCounts = countUserViews(interactionData); // Count views by user
        const sortedViewUsers = await fetchUserDetails(sortUsers(viewCounts)); // Fetch user details and sort
        setTopViewUsers(sortedViewUsers);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching top users:", error);
        setLoading(false);
      }
    };

    getTopUsers();
  }, []);

  const countUserPosts = (postedProducts) => {
    const userCounts = {};
    Object.values(postedProducts).forEach((category) => {
      category.total.forEach((offer) => {
        const chatId = offer.chat_id;
        if (chatId && !skipChatIds.includes(chatId)) {
          userCounts[chatId] = (userCounts[chatId] || 0) + 1;
        }
      });
    });
    return userCounts;
  };

  const countUserViews = (interactionData) => {
    const userCounts = {};
    interactionData.forEach((item) => {
      const chatId = item.viewer_chat_id;
      if (chatId && !skipChatIds.includes(chatId)) {
        userCounts[chatId] = (userCounts[chatId] || 0) + 1;
      }
    });
    return userCounts;
  };

  const sortUsers = (userCounts) => {
    return Object.entries(userCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([chatId, count]) => ({ chatId, count }));
  };

  const fetchUserDetails = async (topUsers) => {
    const userDetails = await Promise.all(
      topUsers.map(async (user) => {
        const chatId = user.chatId;
        try {
          const response = await fetch(
            `http://104.236.64.33:7050/api/UserService/fetchuser?chat_id=${chatId}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await response.json();

          if (data.exists && data.user) {
            return {
              userName: data.user.name || "Unknown",
              count: user.count,
            };
          } else {
            return { userName: "Unknown", count: user.count };
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          return { userName: "Unknown", count: user.count };
        }
      })
    );
    return userDetails;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        margin: "auto",
        width: "80%",
      }}
      className="mt-4"
    >
      <div style={{ marginRight: "20px" }}>
        <h2>Top 10 Users by Number of Posts</h2>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Number of Posts</th>
            </tr>
          </thead>
          <tbody>
            {topPostUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.userName}</td>
                <td>{user.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Top 10 Users by Number of Views</h2>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Number of Views</th>
            </tr>
          </thead>
          <tbody>
            {topViewUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.userName}</td>
                <td>{user.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopUsersTable;
