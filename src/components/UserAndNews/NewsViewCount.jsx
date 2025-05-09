import React, { useEffect, useState } from "react";

function NewsTable() {
  const [newsEntries, setNewsEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        const response = await fetch(
          "http://104.236.64.33:7050/api/UserService/fetchnewsdetails",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        setNewsEntries(data.entries);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news details:", error);
        setLoading(false);
      }
    };

    fetchNewsDetails();
  }, []);

  const handleViewClick = async (url, viewCount, createdAt) => {
    const body = url.split("/").pop();

    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    try {
      const response = await fetch(
        `https://api.telegra.ph/getPage/${body}?return_content=true`
      );
      const data = await response.json();

      if (data.ok && data.result) {
        setSelectedArticle({
          title: data.result.title,
          content: data.result.content,
          viewCount: viewCount,
          createdAt: formattedDate,
        });
      } else {
        console.error("API response did not contain valid result:", data);
      }
    } catch (error) {
      console.error("Error fetching article content:", error);
    }
  };

  const handleCloseBox = () => {
    setSelectedArticle(null);
  };

  const renderContent = (content) => {
    return content.map((item, index) => {
      if (item.tag === "p") {
        const paragraphText = item.children
          .filter((child) => typeof child === "string" && child.trim() !== "")
          .join(" ");
        return paragraphText ? (
          <p key={index} className="mb-2">
            {paragraphText}
          </p>
        ) : null;
      } else if (item.tag === "figure" && item.children[0]?.tag === "img") {
        const imgSrc = item.children[0]?.attrs?.src;
        return imgSrc ? (
          <img
            key={index}
            src={imgSrc}
            alt=""
            className="max-w-full max-h-64 mx-auto my-4 rounded"
          />
        ) : null;
      }
      return null;
    });
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-4 px-4">
      <h2 className="text-2xl font-bold mb-4">News Entries</h2>
      <table className="min-w-full bg-white border border-gray-300 shadow-md rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">No</th>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">View Count</th>
            <th className="py-2 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {newsEntries.map((entry, index) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{index + 1}</td>
              <td className="py-2 px-4 border-b">{entry.title}</td>
              <td className="py-2 px-4 border-b">{entry.view_count}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleViewClick(entry.url, entry.view_count, entry.createdAt)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedArticle && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleCloseBox}
        >
          <div
            className="relative bg-white p-5 rounded shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-300 p-4 z-10 flex justify-between items-center">
              <div className="text-gray-700 font-semibold">
                Views: {selectedArticle.viewCount}
              </div>
              <div className="text-gray-500 font-medium text-sm text-center flex-grow">
                {selectedArticle.createdAt}
              </div>
              <button
                onClick={handleCloseBox}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                &#10005;
              </button>
            </div>
            <h3 className="text-xl font-semibold mb-4">{selectedArticle.title}</h3>
            <div className="text-gray-800">
              {renderContent(selectedArticle.content)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsTable;
