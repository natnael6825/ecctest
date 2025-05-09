import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchAllInteraction } from "../../services/InteractionAndOffer";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "chartjs-adapter-date-fns";
import { Range } from "react-range";

// Register Chart.js components and the datalabels plugin
Chart.register(...registerables, ChartDataLabels);

function TotalViewForAdmin() {
  const [allDates, setAllDates] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [range, setRange] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1️⃣ fetch & build full time‑series
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const data = await fetchAllInteraction();
        const adminOnly = data.filter(
          (i) => i.offer?.poster?.toLowerCase() === "admin"
        );

        const tally = {};
        adminOnly.forEach((i) => {
          const date = new Date(i.createdAt || i.offer.createdAt)
            .toISOString()
            .split("T")[0];
          tally[date] = (tally[date] || 0) + 1;
        });

        const dates = Object.keys(tally).sort(
          (a, b) => new Date(a) - new Date(b)
        );
        const counts = dates.map((d) => tally[d]);

        setAllDates(dates);
        setAllCounts(counts);
        if (dates.length > 1) setRange([0, dates.length - 1]);
      } catch (err) {
        console.error(err);
        setError("Error fetching interactions");
      } finally {
        setLoading(false);
      }
    };
    fetchInteractions();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // 2️⃣ slice by slider range
  const [start, end] = range;
  const labelsToShow = allDates.slice(start, end + 1);
  const dataToShow = allCounts.slice(start, end + 1);

  const chartData = {
    labels: labelsToShow,
    datasets: [
      {
        label: "Total Admin Interactions",
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
      legend: { display: true },
    },
  };

  return (
    <div className="p-4">
      <h2>Total Admin Interactions Over Time</h2>
      <div style={{ height: "300px", position: "relative" }}>
        <Line data={chartData} options={options} />
      </div>

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

export default TotalViewForAdmin;
