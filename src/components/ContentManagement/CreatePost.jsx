import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, uploadFile } from "../../services/postService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  FaFont,
  FaCamera,
  FaLink,
  FaQuoteLeft,
  FaTable,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import { Image as LucideImage, LetterText } from "lucide-react";
import DashboardStatusGrid from "./DashboardStatusGrid";

function CreatePost() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    source: "",
    type: "news", // Default to news
  });

  // State for our body content blocks.
  // Each block is an object { id, type, content, [file] }.
  const [bodyBlocks, setBodyBlocks] = useState([]);
  // To toggle the display of block-addition options.
  const [showOptions, setShowOptions] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState(false);

  // Handle changes for title, source, and type fields.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new block of the specified type.
  const addNewBlock = (blockType) => {
    setBodyBlocks((prev) => [
      ...prev,
      { id: Date.now(), type: blockType, content: "" },
    ]);
    setShowOptions(false);
  };

  // Update a specific block's content.
  const updateBlockContent = (id, content) => {
    setBodyBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    );
  };

  // Remove a block.
  const removeBlock = (id) => {
    setBodyBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  // For image blocks: When a file is chosen, create a preview URL and store the file.
  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setBodyBlocks((prev) =>
        prev.map((block) =>
          block.id === id ? { ...block, content: preview, file } : block
        )
      );
    }
  };

  const clearInputs = () => {
    setFormData({
      title: "",
      source: "",
      type: "news",
    });
    setBodyBlocks([]);
  };

  // Conversion function: converts our bodyBlocks array to our desired JSON structure.
  // This function will be run AFTER any image uploads are complete.
  const convertBlocksToStructuredContent = (blocks) => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "text":
            return {
              type: "paragraph",
              // The rich text from ReactQuill is HTML formatted.
              text: block.content,
            };
          case "subTopic":
            return {
              type: "subTopic", // Save as type "subTopic"
              text: block.content,
            };
          case "image":
            return {
              type: "image",
              url: block.content, // content now holds the actual file link after upload.
              caption: "",
              alt: "",
            };
          case "link":
            return {
              type: "link",
              url: block.content,
            };
          case "quote":
            return {
              type: "quote",
              text: block.content,
              author: "",
            };
          case "table":
            return {
              type: "table",
              html: block.content, // Save the HTML markup of the table.
            };
          default:
            return null;
        }
      })
      .filter(Boolean);
  };

  // Move a block up or down in the array
  const moveBlock = (id, direction) => {
    setBodyBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Process image blocks: Upload each image file (if exists) and update its content.
      const processedBlocks = await Promise.all(
        bodyBlocks.map(async (block) => {
          if (block.type === "image" && block.file) {
            // Upload the image and get the real URL
            const uploadResult = await uploadFile(block.file);
            // Assume uploadResult.filelink contains the actual image URL.
            return {
              ...block,
              content: uploadResult.filelink,
              file: undefined,
            };
          }
          return block;
        })
      );

      const structuredContent =
        convertBlocksToStructuredContent(processedBlocks);
      // Save the structured content as JSON.
      await createPost(
        formData.title,
        JSON.stringify(structuredContent),
        formData.source,
        formData.type
      );
      setSubmitMessage("Post created successfully!");
      setSubmitError(false);
      navigate("/ankuaru/preViewPosts");
    } catch (error) {
      setSubmitMessage("Error creating post: " + error.message);
      setSubmitError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray">
      <DashboardStatusGrid />
      <div className="container mx-auto max-w-6xl py-12">
        <div className="bg-transparent rounded-lg p-8">
          <div className="flex justify-between items-center mb-8 border-b pb-3">
            <h1 className="text-3xl font-rthin">Create New Post</h1>
            <div className="flex items-center space-x-4">
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="px-10 py-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 bg-gray text-lg text-gray-700"
              >
                <option value="news">News</option>
                <option value="tender">Tender</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Title"
                className="w-full px-3 py-2 border-b focus:outline-none focus:border-b-gray-600 bg-gray text-3xl font-rlight"
              />
            </div>

            {/* Source Field */}
            <div>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                required
                placeholder="Source"
                className="w-full px-3 py-2 border-b bg-gray text-xl font-rlight focus:outline-none focus:border-b-gray-600"
              />
            </div>

            <div>
              {/* Render already added blocks */}
              {bodyBlocks.map((block) => (
                <div
                  key={block.id}
                  className="relative border rounded-md p-4 mb-4 shadow-md"
                >
                  {/* ← move controls */}
                  <div className="absolute right-0 top-0 flex flex-col items-center pl-5 pt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(block.id, "up")}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaChevronUp />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(block.id, "down")}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaChevronDown />
                    </button>
                  </div>
                  <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                  {/* To keep a consistent layout, you can leave space on the left of each block */}
                  <div className="ml-16">
                    {block.type === "text" && (
                      <ReactQuill
                        value={block.content}
                        onChange={(content) =>
                          updateBlockContent(block.id, content)
                        }
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "link"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["clean"],
                          ],
                        }}
                      />
                    )}
                    {block.type === "subTopic" && (
                      // Render subTopic as an input styled as an H3.
                      <input
                        type="text"
                        placeholder="Sub Topic"
                        value={block.content}
                        onChange={(e) =>
                          updateBlockContent(block.id, e.target.value)
                        }
                        className="w-full px-3  font-bold text-xl "
                      />
                    )}
                    {block.type === "table" && (
                      <div
                        className="w-full p-2 border rounded-md bg-gray-100"
                        contentEditable
                        onBlur={(e) =>
                          updateBlockContent(
                            block.id,
                            e.currentTarget.innerHTML
                          )
                        }
                        dangerouslySetInnerHTML={{ __html: block.content }}
                      />
                    )}
                    {block.type === "image" && (
                      <>
                        {block.content ? (
                          <div>
                            <img
                              src={block.content}
                              alt="Preview"
                              className="max-h-64"
                            />
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="mt-2 text-red-500 text-sm"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(block.id, e)}
                          />
                        )}
                      </>
                    )}
                    {block.type === "link" && (
                      <div className="flex flex-col space-y-2">
                        <input
                          type="text"
                          placeholder="Display Text (e.g., Click here)"
                          value={block.displayText || ""}
                          onChange={(e) =>
                            updateBlockContent(block.id, {
                              ...block,
                              displayText: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-lg border rounded-md bg-gray-50"
                        />
                        <input
                          type="text"
                          placeholder="Enter URL (e.g., https://example.com)"
                          value={block.url || ""}
                          onChange={(e) =>
                            updateBlockContent(block.id, {
                              ...block,
                              url: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-lg border rounded-md bg-gray-50"
                        />
                      </div>
                    )}

                    {block.type === "quote" && (
                      <input
                        type="text"
                        placeholder="Enter quote here"
                        value={block.content}
                        onChange={(e) =>
                          updateBlockContent(block.id, e.target.value)
                        }
                        className="w-full px-3 py-2 text-lg border-b rounded-md bg-gray"
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* New block addition area */}
              <div className="relative border rounded-md p-4">
                {/* Fixed plus button on the left side */}
                <div className="absolute left-0 top-0 h-full flex">
                  <button
                    type="button"
                    onClick={() => setShowOptions(!showOptions)}
                    className="w-12 h-full flex items-center justify-center border border-dashed border-gray-400 text-2xl bg-green-500 text-white"
                  >
                    +
                  </button>
                </div>

                {/* Content area of the add block section – always shifted to the right */}
                <div className="ml-16">
                  {showOptions ? (
                    <div className="mt-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          addNewBlock("text");
                          setShowOptions(false);
                        }}
                        className="px-4 py-2 bg-transparent text-gray-500 rounded"
                      >
                        <LetterText size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addNewBlock("subTopic");
                          setShowOptions(false);
                        }}
                        className="px-4  bg-transparent text-gray-500 rounded"
                      >
                        Sub
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addNewBlock("table");
                          setShowOptions(false);
                        }}
                        className="px-4 bg-transparent text-gray-500 rounded"
                      >
                        <FaTable size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addNewBlock("image");
                          setShowOptions(false);
                        }}
                        className="px-4 py-2 bg-transparent text-gray-500 rounded"
                      >
                        <LucideImage size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addNewBlock("link");
                          setShowOptions(false);
                        }}
                        className="px-4 py-2 bg-transparent text-gray-500 rounded"
                      >
                        <FaLink size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addNewBlock("quote");
                          setShowOptions(false);
                        }}
                        className="px-4 py-2 bg-transparent text-gray-500 rounded"
                      >
                        <FaQuoteLeft size={20} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400">Tap + to add a body block</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-start space-x-4 mt-5">
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 text-white rounded-md ${
                  saving
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-300"
                }`}
              >
                {saving ? "Creating..." : "Create Post"}
              </button>

              <button
                type="button"
                onClick={clearInputs}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
              >
                Clear Inputs
              </button>

              <button
                type="button"
                onClick={() => navigate("/ankuaru/preViewPosts")}
                className="px-4 py-2 text-white hover:bg-red-300 border border-gray-300 rounded-md bg-red-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
