"use client";

import { AI_MODELS, REASONING_MODELS } from "@/utils/model_lists";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "models" | "appearance" | "account";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<Tab>("models");
  const [userSelectedModels, setUserSelectedModels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModelSearchFocused, setIsModelSearchFocused] = useState(false);
  const router = useRouter();

  // Load saved models from localStorage on component mount
  useEffect(() => {
    try {
      const savedModels = localStorage.getItem("userSelectedModels");
      if (savedModels) {
        setUserSelectedModels(JSON.parse(savedModels));
      } else {
        // Default to popular models if nothing is saved
        const defaultModels = [
          "gpt-5-nano",
          "gpt-4o",
          "claude-opus-4",
          "gpt-4.1",
          "gemini-1.5-flash",
          "mistral-medium",
          "deepseek-chat",
        ];
        setUserSelectedModels(defaultModels);
        localStorage.setItem(
          "userSelectedModels",
          JSON.stringify(defaultModels)
        );
      }
    } catch (error) {
      console.error("Error loading saved models:", error);
    }
  }, []);

  // Save selected models to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "userSelectedModels",
        JSON.stringify(userSelectedModels)
      );
    } catch (error) {
      console.error("Error saving models to localStorage:", error);
    }
  }, [userSelectedModels]);

  const toggleModelSelection = (model: string) => {
    if (userSelectedModels.includes(model)) {
      setUserSelectedModels(userSelectedModels.filter((m) => m !== model));
    } else {
      setUserSelectedModels([...userSelectedModels, model]);
    }
  };

  const filteredModels = searchTerm
    ? AI_MODELS.filter((model: string) =>
        model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : AI_MODELS;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-8">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "models"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("models")}
          >
            AI Models
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "appearance"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("appearance")}
          >
            Appearance
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "account"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === "models" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Model Preferences
                </h2>
                <p className="text-gray-400 mb-6">
                  Select models you want to appear in the dropdown menu when
                  regenerating responses. These models will be available for
                  quick access in conversations.
                </p>
              </div>

              {/* Search and selection area */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="mb-4">
                  <label
                    htmlFor="model-search"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Search Models
                  </label>
                  <div
                    className={`relative rounded-md ${
                      isModelSearchFocused ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <input
                      id="model-search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsModelSearchFocused(true)}
                      onBlur={() => setIsModelSearchFocused(false)}
                      placeholder="Type to search models..."
                      className="block w-full px-4 py-3 bg-gray-700 border-0 text-white rounded-md focus:outline-none placeholder-gray-400 sm:text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-300 mb-2">
                    Your Selected Models ({userSelectedModels.length})
                  </h3>
                  {userSelectedModels.length === 0 ? (
                    <div className="bg-gray-900 rounded-md p-4 text-center text-gray-400">
                      No models selected. Select models from the list below.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userSelectedModels.map((model) => {
                        const hasReasoning = REASONING_MODELS.includes(model);
                        return (
                          <div
                            key={model}
                            className={`bg-gray-700 rounded-md px-3 py-2 text-sm flex items-center gap-2 ${
                              hasReasoning ? "border-l-2 border-purple-500" : ""
                            }`}
                          >
                            <span
                              className={`${
                                hasReasoning ? "text-purple-300" : "text-white"
                              }`}
                            >
                              {model}
                            </span>
                            <button
                              onClick={() => toggleModelSelection(model)}
                              className="text-gray-400 hover:text-white"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-gray-700"></div>

                {/* Available models */}
                <div>
                  <h3 className="text-md font-medium text-gray-300 mb-4">
                    Available Models
                  </h3>

                  {filteredModels.length === 0 ? (
                    <div className="bg-gray-900 rounded-md p-8 text-center text-gray-400">
                      No models found matching &ldquo;{searchTerm}&rdquo;
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredModels.map((model: string) => {
                        const isSelected = userSelectedModels.includes(model);
                        const hasReasoning = REASONING_MODELS.includes(model);

                        return (
                          <div
                            key={model}
                            onClick={() => toggleModelSelection(model)}
                            className={`
                              px-3 py-2 border rounded-md cursor-pointer flex justify-between items-center
                              ${
                                isSelected
                                  ? "bg-blue-900/40 border-blue-500"
                                  : "bg-gray-800 border-gray-700 hover:border-gray-600"
                              }
                              ${
                                hasReasoning
                                  ? "border-l-2 border-l-purple-500"
                                  : ""
                              }
                            `}
                          >
                            <div className="flex-1 truncate mr-2">
                              <span
                                className={`text-sm ${
                                  hasReasoning
                                    ? "text-purple-300"
                                    : "text-white"
                                }`}
                              >
                                {model}
                              </span>
                              {hasReasoning && (
                                <span className="ml-2 bg-purple-700 text-white text-[9px] px-1 rounded">
                                  REASONING
                                </span>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent div onClick
                                className="w-4 h-4 accent-blue-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              <p className="text-gray-400">
                Appearance settings will be implemented in future updates.
              </p>
            </div>
          )}

          {activeTab === "account" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <p className="text-gray-400">
                Account settings will be implemented in future updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
