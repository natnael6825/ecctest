import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getAllPost } from "../../services/postService";
import DashboardStatusGrid from "./DashboardStatusGrid";

function PostStatistics() {
  const [chartData, setChartData] = useState([]);
  const [averageViews, setAverageViews] = useState(0);
  const [posts, setPosts] = useState([]);
  const [postsPerDay, setPostsPerDay] = useState([]);
  const [viewsPerPost, setViewsPerPost] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const posts = await getAllPost();
        setPosts(posts);

        const viewMap = {};
        const postCountMap = {};
        let totalViews = 0;

        const viewsPerPostData = posts.map((post) => {
          const views = post.view_count || 0;
          const title = post.id || `Post ${post.id}`;
          totalViews += views;
          return { title, views };
        });

        posts.forEach((post) => {
          const date = new Date(post.createdAt).toISOString().split("T")[0];

          // For total views per day
          const views = post.view_count || 0;
          if (viewMap[date]) {
            viewMap[date] += views;
          } else {
            viewMap[date] = views;
          }

          // For number of posts per day
          postCountMap[date] = (postCountMap[date] || 0) + 1;
        });

        const sortedDates = Object.keys(viewMap).sort();

        const dailyViews = sortedDates.map((date) => ({
          date,
          views: viewMap[date],
        }));

        const postsPerDayData = sortedDates.map((date) => ({
          date,
          posts: postCountMap[date],
        }));

        const avgViews = sortedDates.length
          ? totalViews / sortedDates.length
          : 0;

        setChartData(dailyViews);
        setPostsPerDay(postsPerDayData);
        setViewsPerPost(viewsPerPostData);
        setAverageViews(avgViews.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch post statistics:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <DashboardStatusGrid />
      <div className="p-4 space-y-5">
        <div className=" space-y-5">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              📅 Number of Posts per Day
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={postsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              👁️ Views per Post
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsPerPost}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="title"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={120}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            📋 Posts & View Counts
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Title</th>
                  <th className="px-4 py-2 border">Views</th>
                  <th className="px-4 py-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{post.id}</td>
                    <td className="px-4 py-2 border">{post.title}</td>
                    <td className="px-4 py-2 border">{post.view_count}</td>
                    <td className="px-4 py-2 border">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostStatistics;
