import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { getAllUsers } from "../../services/UserEngagementServ";
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

// Register necessary chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RegisteredUsersByMonth() {
  const [usersByTime, setUsersByTime] = useState({ months: [], countData: [] });
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("Month");
  const [range, setRange] = useState([0, 0]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (Array.isArray(response)) {
          const processedData =
            viewType === "Month"
              ? countUsersByMonth(response)
              : countUsersByDay(response);
          setUsersByTime(processedData);
          setRange([0, processedData.months.length - 1]);
        }
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [viewType]);

  // Function to count users per month
  const countUsersByMonth = (users) => {
    const counts = {};
    users.forEach((user) => {
      const registrationDate = new Date(user.createdAt);
      const month = registrationDate.toLocaleString("default", {
        month: "long",
      });
      const year = registrationDate.getFullYear();
      const monthYear = `${month} ${year}`;

      counts[monthYear] = counts[monthYear] ? counts[monthYear] + 1 : 1;
    });

    const sortedMonths = generateMonthsArray(counts);
    const countData = sortedMonths.map((month) => counts[month] || 0);

    return { months: sortedMonths, countData };
  };

  // Function to count users per day
  const countUsersByDay = (users) => {
    const counts = {};
    users.forEach((user) => {
      const registrationDate = new Date(user.createdAt);
      const day = registrationDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      counts[day] = counts[day] ? counts[day] + 1 : 1;
    });

    const sortedDays = Object.keys(counts).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const countData = sortedDays.map((day) => counts[day] || 0);

    return { months: sortedDays, countData };
  };

  const generateMonthsArray = (counts) => {
    const allMonths = [];
    const startDate = new Date(Object.keys(counts)[0]);
    const endDate = new Date(); // current month

    while (startDate <= endDate) {
      const month = startDate.toLocaleString("default", { month: "long" });
      const year = startDate.getFullYear();
      allMonths.push(`${month} ${year}`);
      startDate.setMonth(startDate.getMonth() + 1);
    }

    return allMonths;
  };

  const handleRangeChange = (values) => setRange(values);

  const filteredDates = usersByTime.months.slice(range[0], range[1] + 1);
  const filteredCounts = usersByTime.countData.slice(range[0], range[1] + 1);

  const chartData = {
    labels: filteredDates,
    datasets: [
      {
        label: "Registered Users",
        data: filteredCounts,
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      {/* Dropdown to select Month or Day view */}
      <div
        style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}
      >
        <label
          htmlFor="viewType"
          style={{ marginRight: "10px", fontWeight: "bold" }}
        >
          View by:
        </label>
        <select
          id="viewType"
          value={viewType}
          onChange={(e) => setViewType(e.target.value)}
          style={{
            padding: "5px 10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            appearance: "none",
            background:
              "white url('data:image/svg+xml;charset=UTF-8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22><polygon points=%225,6 15,6 10,12%22 fill=%22black%22/></svg>') no-repeat right 10px center",
            backgroundSize: "10px",
          }}
        >
          <option value="Month">Monthly View</option>
          <option value="Day">Daily View</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ height: "400px", position: "relative" }}>
          <Line
            data={{
              labels: filteredDates,
              datasets: [
                {
                  label: "Registered Users",
                  data: filteredCounts,
                  borderColor: "#007bff",
                  backgroundColor: "rgba(0, 123, 255, 0.2)",
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false, // Disable the legend
                },
                tooltip: { enabled: true },
                datalabels: {
                  color: "#000",
                  font: { weight: "bold", size: 12 },
                  align: "top",
                  anchor: "end",
                  offset: 10,
                },
              },
              elements: { point: { radius: 0 } },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: viewType === "Month" ? "Months" : "Days",
                  },
                },
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Number of Registered Users" },
                },
              },
            }}
          />
        </div>
      )}

      {/* Slider for adjusting the date range */}
      {usersByTime.months.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Range
            values={range}
            step={1}
            min={0}
            max={usersByTime.months.length - 1}
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
                    left: `${
                      (range[0] / (usersByTime.months.length - 1)) * 100
                    }%`,
                    width: `${
                      ((range[1] - range[0]) /
                        (usersByTime.months.length - 1)) *
                      100
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
                  {usersByTime.months[range[index]]}
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

export default RegisteredUsersByMonth;
