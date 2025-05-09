import React, { useState, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
// Quill emoji plugin imports
// import "quill-emoji/dist/quill-emoji.css";
// import {
//   EmojiBlot,
//   ShortNameEmoji,
//   ToolbarEmoji,
//   TextAreaEmoji,
// } from "quill-emoji";

import * as Emoji from "quill-emoji";
import "quill-emoji/dist/quill-emoji.css";

import {
  getAllBanks,
  createExchangeRate,
  fetchAllExchangeRate,
  updateExchangeRate,
} from "../../services/adminService";
import { isSameDay } from "date-fns";
import DashboardStatusGrid from "./DashboardStatusGrid";

// Register emoji modules
// Quill.register({ "formats/emoji": EmojiBlot }, true);
// Quill.register({ "modules/emoji-shortname": ShortNameEmoji }, true);
// Quill.register({ "modules/emoji-toolbar": ToolbarEmoji }, true);
// Quill.register({ "modules/emoji-textarea": TextAreaEmoji }, true);
Quill.register("modules/emoji", Emoji);

const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["emoji"], // <- the emoji picker button
    ["clean"],
  ],
  "emoji-toolbar": true,
  "emoji-textarea": false, // turn on/off the textarea picker
  "emoji-shortname": true, // allow `:smile:` style input
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "image",
  "emoji",
];

function AddExchangeRate() {
  const [banks, setBanks] = useState([]);
  const [source, setSource] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [rateEntries, setRateEntries] = useState([
    { bankId: "", sell: "", buy: "" },
  ]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [exchangeRateId, setExchangeRateId] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchBanksAndRates = async () => {
      try {
        const banksResponse = await getAllBanks();
        let banksData = [];
        if (Array.isArray(banksResponse)) {
          banksData = banksResponse;
        } else if (banksResponse && Array.isArray(banksResponse.banks)) {
          banksData = banksResponse.banks;
        }
        setBanks(banksData);
        if (!isEditMode && banksData.length) {
          setRateEntries([{ bankId: banksData[0].id, sell: "", buy: "" }]);
        }

        const ratesResponse = await fetchAllExchangeRate();
        if (ratesResponse && Array.isArray(ratesResponse.data)) {
          const todayRate = ratesResponse.data.find((rate) =>
            isSameDay(new Date(rate.createdAt), new Date())
          );

          console.log(todayRate);
          if (todayRate) {
            setIsEditMode(true);
            setSource(todayRate.source || "");
            setHashtag(todayRate.hashtag || "");
            setExchangeRateId(todayRate.id);
            setUserMessage(todayRate.message || "");
            const body = todayRate.body;
            const entries = Object.keys(body)
              .filter((key) => key !== "Average")
              .map((bankName) => {
                const bank = banksData.find((b) => b.name === bankName);
                return {
                  bankId: bank ? bank.id : "",
                  sell: body[bankName].sellPrice || "",
                  buy: body[bankName].buyPrice || "",
                };
              });
            setRateEntries(entries);
          }
        }
      } catch (error) {
        console.error("Error fetching banks and exchange rates:", error);
      }
    };
    fetchBanksAndRates();
  }, []);

  const handleRateChange = (index, field, value) => {
    const updated = [...rateEntries];
    updated[index][field] = value;
    setRateEntries(updated);
  };

  const addRateEntry = () => {
    setRateEntries((prev) => [
      ...prev,
      { bankId: banks[0]?.id || "", sell: "", buy: "" },
    ]);
  };

  const removeRateEntry = (idx) => {
    setRateEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalid = rateEntries.some(
      ({ sell, buy }) => parseFloat(sell) <= 0 || parseFloat(buy) <= 0
    );
    if (invalid) {
      setFeedbackMessage("All buy/sell prices must be greater than zero.");
      setSubmitError(true);
      return;
    }

    setFormSubmitting(true);
    setFeedbackMessage("");
    const normalizedSource = source.trim() || null;

    const ratesBody = {};
    let totalSell = 0,
      totalBuy = 0,
      count = 0;

    rateEntries.forEach((entry) => {
      const bank = banks.find((b) => String(b.id) === String(entry.bankId));
      if (!bank) return;
      const sellPrice = parseFloat(entry.sell) || 0;
      const buyPrice = parseFloat(entry.buy) || 0;
      ratesBody[bank.name] = { sellPrice, buyPrice };
      totalSell += sellPrice;
      totalBuy += buyPrice;
      count++;
    });

    ratesBody.Average = {
      sellPrice: count ? totalSell / count : 0,
      buyPrice: count ? totalBuy / count : 0,
    };

    try {
      let result;
      if (isEditMode) {
        result = await updateExchangeRate(
          ratesBody,
          normalizedSource,
          hashtag,
          exchangeRateId,
          userMessage
        );
        setFeedbackMessage("Exchange rate updated successfully.");
      } else {
        result = await createExchangeRate(
          ratesBody,
          normalizedSource,
          hashtag,
          userMessage
        );
        setFeedbackMessage("Exchange rate created successfully.");
      }
      console.log("Create/Update response:", result);

      // reset
      setSource("");
      setHashtag("");
      setUserMessage("");
      setRateEntries([{ bankId: banks[0]?.id || "", sell: "", buy: "" }]);
      setIsEditMode(false);
      setExchangeRateId(null);
      window.location.reload();
    } catch (err) {
      console.error("Error saving exchange rate:", err);
      setFeedbackMessage("There was an error saving the exchange rate.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div>
      <DashboardStatusGrid />
      <div className=" flex items-center justify-center">
        <div className="max-w-2xl w-full bg-transparent p-8 rounded-md">
          <h2 className="text-3xl font-bold mb-6 text-center">
            {isEditMode ? "Edit Exchange Rate" : "Add Exchange Rate"}
          </h2>
          {feedbackMessage && (
            <div className="mb-4 text-center text-sm text-green-600">
              {feedbackMessage}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Source */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="source">
                Source (Optional)
              </label>
              <input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="Enter source"
              />
            </div>

            {/* Hashtag */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="hashtag">
                Hashtag (Optional)
              </label>
              <input
                id="hashtag"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="Enter hashtag"
              />
            </div>

            {/* Rich Message Editor */}
            <div className="mb-16">
              <label className="block text-gray-700 mb-1" htmlFor="userMessage">
                Message (Optional)
              </label>
              <ReactQuill
                id="userMessage"
                value={userMessage}
                onChange={setUserMessage}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write your message..."
                theme="snow"
                style={{ height: "150px", marginBottom: "30px" }}
              />
            </div>

            {/* Rate Entries */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Exchange Rates</h3>
              {rateEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 p-4 border rounded-md"
                >
                  {/* Bank Dropdown */}
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-1">Bank</label>
                    <select
                      value={entry.bankId}
                      onChange={(e) =>
                        handleRateChange(idx, "bankId", e.target.value)
                      }
                      className="w-full border border-gray-300 p-2 rounded-md"
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Sell */}
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-1">
                      Sell Price
                    </label>
                    <input
                      type="number"
                      min="0.01" // <- disallow zero and negatives
                      step="0.01" // <- allow cents
                      value={entry.sell}
                      onChange={(e) =>
                        handleRateChange(idx, "sell", e.target.value)
                      }
                      className="w-full border border-gray-300 p-2 rounded-md"
                      placeholder="Sell Price"
                      required
                    />
                  </div>
                  {/* Buy */}
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-1">
                      Buy Price
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={entry.buy}
                      onChange={(e) =>
                        handleRateChange(idx, "buy", e.target.value)
                      }
                      className="w-full border border-gray-300 p-2 rounded-md"
                      placeholder="Buy Price"
                      required
                    />
                  </div>
                  {rateEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRateEntry(idx)}
                      className="text-red-500 hover:underline mt-6"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRateEntry}
                className="text-blue-600 hover:underline"
              >
                + Add another rate
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={formSubmitting}
            >
              {formSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                ? "Update Exchange Rate"
                : "Save Exchange Rate"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddExchangeRate;
