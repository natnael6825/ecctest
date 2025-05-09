import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "chartjs-adapter-date-fns";
import { Range } from "react-range";
import { fetchPostedProducts } from "../../services/InteractionAndOffer";

// register Chart.js + plugins
Chart.register(...registerables, ChartDataLabels);

function DailyAdminPostsChart() {
  const [allDates, setAllDates] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [range, setRange] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) fetch & compute full date→count
  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        const countsObj = await fetchPostedProducts();
        const allPosts = Object.values(countsObj).flatMap((c) => c.total);
        const adminOnly = allPosts.filter(
          (post) => post.poster?.toLowerCase() === "admin"
        );

        // tally per‑day
        const tally = {};
        adminOnly.forEach((p) => {
          const day = new Date(p.createdAt).toISOString().split("T")[0];
          tally[day] = (tally[day] || 0) + 1;
        });

        const dates = Object.keys(tally).sort(
          (a, b) => new Date(a) - new Date(b)
        );
        const counts = dates.map((d) => tally[d]);

        setAllDates(dates);
        setAllCounts(counts);
        // initialize slider to full range
        if (dates.length > 1) setRange([0, dates.length - 1]);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin posts");
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcess();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;

  // 2) slice by slider
  const [start, end] = range;
  const labelsToShow = allDates.slice(start, end + 1);
  const dataToShow = allCounts.slice(start, end + 1);

  const chartData = {
    labels: labelsToShow,
    datasets: [
      {
        label: "Admin Posts per Day",
        data: dataToShow,
        fill: false,
        borderColor: "blue",
        tension: 0.4,
        pointBackgroundColor: "blue",
        datalabels: {
          anchor: "end",
          align: "top",
          font: { weight: "bold" },
          offset: 4,
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "MMMM d, yyyy",
          displayFormats: { day: "MMMM d, yyyy" },
        },
        ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 },
      },
      y: { beginAtZero: true },
    },
    plugins: {
      datalabels: { display: true },
    },
  };

  return (
    <div className="p-4">
      <h2>Daily Products Posted by Admin</h2>

      {/* Chart */}
      <div style={{ height: "300px", position: "relative" }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Slider: only if multiple dates */}
      {allDates.length > 1 && (
        <div className="mt-6">
          <Range
            values={range}
            step={1}
            min={0}
            max={allDates.length - 1}
            onChange={setRange}
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
                    left: `${(start / (allDates.length - 1)) * 100}%`,
                    width: `${((end - start) / (allDates.length - 1)) * 100}%`,
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
                    fontSize: "12px",
                    color: "#333",
                  }}
                >
                  {allDates[range[index]]}
                </div>
              </div>
            )}
          />

          <div className="mt-2 font-medium">
            Showing from <strong>{labelsToShow[0]}</strong> to{" "}
            <strong>{labelsToShow[labelsToShow.length - 1]}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyAdminPostsChart;
