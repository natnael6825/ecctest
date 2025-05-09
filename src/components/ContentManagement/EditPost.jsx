import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostById } from "../../services/userServices";
import { editpost, uploadFile } from "../../services/postService"; // adjust path as needed
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// Import icons from react-icons
import {
  FaFont,
  FaCamera,
  FaLink,
  FaQuoteLeft,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaTable,
} from "react-icons/fa";
import { Image as LucideImage, LetterText } from "lucide-react";
import DashboardStatusGrid from "./DashboardStatusGrid";

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tracking loading, error, and saving state.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", isError: false });

  // Form data for title, source, and type.
  const [formData, setFormData] = useState({
    title: "",
    source: "",
    type: "",
  });

  // State for body blocks (each block is an object: { id, type, content, [file] }).
  const [bodyBlocks, setBodyBlocks] = useState([]);
  // Toggle for showing the plus icon block options.
  const [showOptions, setShowOptions] = useState(false);

  // Fetch the post and initialize formData and bodyBlocks.
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetchPostById(id);
        if (response.post) {
          const post = response.post;
          let parsedBody = [];
          try {
            parsedBody = JSON.parse(post.body);
          } catch (e) {
            console.error("Failed to parse body content:", e);
          }
          setFormData({
            title: post.title,
            source: post.source,
            type: post.type,
          });
          if (Array.isArray(parsedBody)) {
            const convertedBlocks = parsedBody.map((block, index) => {
              const uniqueId = block.id || Date.now() + index;
              if (block.type === "paragraph") {
                return {
                  id: uniqueId,
                  type: "text",
                  content: block.text || "",
                };
              } else if (block.type === "subTopic") {
                return {
                  id: uniqueId,
                  type: "subTopic",
                  content: block.text || "",
                };
              } else if (block.type === "image") {
                return {
                  id: uniqueId,
                  type: "image",
                  content: block.url || "",
                };
              } else if (block.type === "link") {
                return { id: uniqueId, type: "link", content: block.url || "" };
              } else if (block.type === "quote") {
                return {
                  id: uniqueId,
                  type: "quote",
                  content: block.text || "",
                };
              }
              if (block.type === "table") {
                return {
                  id: uniqueId,
                  type: "table",
                  content: block.html || "", // ← grab the saved HTML
                };
              }
              return { id: uniqueId, ...block };
            });
            setBodyBlocks(convertedBlocks);
          } else {
            setBodyBlocks([]);
          }
        } else {
          setError("Post not found");
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching post");
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Handle changes for title, source, and type.
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

  // Handle file selection for image blocks.
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

  // Conversion function: transforms bodyBlocks array to structured JSON.
  const convertBlocksToStructuredContent = (blocks) => {
    return blocks
      .map((block) => {
        if (block.type === "text" || block.type === "paragraph") {
          return { type: "paragraph", text: block.content || "" };
        } else if (block.type === "image") {
          return {
            type: "image",
            url: block.content || "",
            caption: "",
            alt: "",
          };
        } else if (block.type === "link") {
          return { type: "link", url: block.content || "" };
        } else if (block.type === "quote") {
          return { type: "quote", text: block.content || "", author: "" };
        } else if (block.type === "table") {
          // grab the HTML you rendered via `block.html`
          return { type: "table", html: block.content || block.html || "" };
        } else if (block.type === "subTopic") {
          return {
            type: "subTopic", // Save as type "subTopic"
            text: block.content,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(
      () => setToast({ message: "", isError: false }),
      3000
    );
    return () => clearTimeout(timer);
  }, [toast]);

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Process image blocks: upload files and update their content.
      const processedBlocks = await Promise.all(
        bodyBlocks.map(async (block) => {
          if (block.type === "image" && block.file) {
            const uploadResult = await uploadFile(block.file);
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
      console.log(structuredContent);
      console.log("ID", id);
      await editpost(
        id,
        formData.title,
        JSON.stringify(structuredContent),
        formData.source,
        formData.type
      );

      setToast({ message: "Post updated successfully!", isError: false });

      navigate("/ankuaru/preViewPosts");
    } catch (error) {
      setToast({ message: "Error updating post:", isError: false });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray">
        <div className="container mx-auto max-w-6xl py-12">
          <p className="text-center">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray">
        <div className="container mx-auto max-w-6xl py-12">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray">
      <DashboardStatusGrid />
      <div className="container mx-auto max-w-6xl py-12">
        {/* Card container styled similarly to CreatePost */}
        <div className="bg-transparent rounded-lg p-8">
          {/* Header with title and Cancel button */}
          <div className="flex justify-between items-center mb-8 border-b pb-3">
            <h1 className="text-3xl font-rthin">Edit Post</h1>
            <button
              onClick={() => navigate("/ankuaru/preViewPosts")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
          {toast.message && (
            <div
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow z-50
      ${
        toast.isError
          ? "bg-red-100 border-red-400 text-red-700"
          : "bg-green-100 border-green-400 text-green-700"
      }`}
            >
              {toast.message}
              <button
                onClick={() => setToast({ message: "", isError: false })}
                className="ml-4 font-bold"
              >
                ×
              </button>
            </div>
          )}

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

            {/* Type Selector */}
            <div>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-6 py-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 bg-gray text-lg text-gray-700"
              >
                <option value="news">News</option>
                <option value="tender">Tender</option>
                <option value="event">Event</option>
              </select>
            </div>

            {/* Custom Body Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="border rounded-md p-4">
                {/* Render already added blocks */}
                {bodyBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="relative border rounded-md p-4 mb-4 shadow-md"
                  >
                    {/* Remove Button */}
                    <div className="absolute left-2 top-2">
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                    {/* Move Controls */}
                    <div className="absolute right-2 top-2 flex flex-col space-y-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, "up")}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, "down")}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaChevronDown size={16} />
                      </button>
                    </div>
                    <div className="ml-16">
                      {block.type === "text" && (
                        <ReactQuill
                          value={block.content || ""}
                          onChange={(content) =>
                            updateBlockContent(block.id, content)
                          }
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ["bold", "italic", "underline"],
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
                        <input
                          type="text"
                          placeholder="Enter link here"
                          value={block.content}
                          onChange={(e) =>
                            updateBlockContent(block.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      )}
                      {block.type === "quote" && (
                        <input
                          type="text"
                          placeholder="Enter quote here"
                          value={block.content}
                          onChange={(e) =>
                            updateBlockContent(block.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      )}
                      {block.type === "table" && (
                        <div
                          className="overflow-auto"
                          dangerouslySetInnerHTML={{ __html: block.html }}
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
                  {/* Content area of the add block section (shifted right) */}
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
                          className="px-4 py-2 bg-transparent text-gray-500 rounded"
                        >
                          Sub
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addNewBlock("table");
                            setShowOptions(false);
                          }}
                          className="px-4 py-2 bg-transparent text-gray-500 rounded"
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
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 text-white rounded-md ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPost;
