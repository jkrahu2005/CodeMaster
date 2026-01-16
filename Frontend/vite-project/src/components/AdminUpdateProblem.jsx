import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function AdminUpdateProblem() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      tags: "",
      visibleTestCases: [],
      hiddenTestCases: [],
      startCode: [],
      referenceSolution: []
    }
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        console.log("Fetched problem:", response.data);
        
        const problemData = response.data;
        setProblem(problemData);
        
        // Transform data for form - ADD EXPLAINATION FIELD
        const formData = {
          title: problemData.title || "",
          description: problemData.description || "",
          difficulty: problemData.difficulty || "easy",
          tags: problemData.tags || "",
          visibleTestCases: problemData.visibleTestCases?.map(tc => ({
            input: tc.input || "",
            output: tc.output || "",
            explaination: tc.explaination || "" // ADD THIS
          })) || [],
          hiddenTestCases: problemData.hiddenTestCases?.map(tc => ({
            input: tc.input || "",
            output: tc.output || "",
            explaination: tc.explaination || "" // ADD THIS
          })) || [],
          startCode: problemData.startCode?.map(code => ({
            language: code.language || "",
            initialCode: code.initialCode || code.code || ""
          })) || [],
          referenceSolution: problemData.referenceSolution?.map(solution => ({
            language: solution.language || "",
            completeCode: solution.completeCode || solution.code || ""
          })) || []
        };
        
        console.log("Form data:", formData);
        reset(formData);
        
      } catch (error) {
        console.error("Error fetching problem:", error);
        toast.error("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId, reset]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      console.log("Submitting data:", data);
      
      // Filter out empty values for PATCH request
      const formattedData = {};
      
      // Only include fields that have values
      if (data.title) formattedData.title = data.title;
      if (data.description) formattedData.description = data.description;
      if (data.difficulty) formattedData.difficulty = data.difficulty;
      if (data.tags) formattedData.tags = data.tags;
      
      // Test cases - only include if there are valid ones - ADD EXPLAINATION
      const validVisibleTestCases = data.visibleTestCases
        .filter(tc => tc.input && tc.output)
        .map(tc => ({ 
          input: tc.input, 
          output: tc.output,
          explaination: tc.explaination || "" // ADD THIS
        }));
      if (validVisibleTestCases.length > 0) {
        formattedData.visibleTestCases = validVisibleTestCases;
      }
      
      const validHiddenTestCases = data.hiddenTestCases
        .filter(tc => tc.input && tc.output)
        .map(tc => ({ 
          input: tc.input, 
          output: tc.output,
          explaination: tc.explaination || "" // ADD THIS
        }));
      if (validHiddenTestCases.length > 0) {
        formattedData.hiddenTestCases = validHiddenTestCases;
      }
      
      // Start code - only include if there are valid ones
      const validStartCode = data.startCode
        .filter(code => code.language && code.initialCode)
        .map(code => ({ 
          language: code.language, 
          initialCode: code.initialCode 
        }));
      if (validStartCode.length > 0) {
        formattedData.startCode = validStartCode;
      }
      
      // Reference solution - only include if there are valid ones
      const validReferenceSolution = data.referenceSolution
        .filter(solution => solution.language && solution.completeCode)
        .map(solution => ({ 
          language: solution.language, 
          completeCode: solution.completeCode 
        }));
      if (validReferenceSolution.length > 0) {
        formattedData.referenceSolution = validReferenceSolution;
      }

      console.log("Formatted data for PATCH:", formattedData);
      
      // Use PATCH request instead of PUT
      const response = await axiosClient.patch(
        `/problem/update/${problemId}`,
        formattedData
      );
      
      console.log("PATCH update response:", response);
      toast.success("Problem updated successfully!");
      navigate("/admin/update");
      
    } catch (error) {
      console.error("Error updating problem:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Failed to update problem";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Add new test case WITH EXPLAINATION
  const addTestCase = (type) => {
    const currentValue = watch(type);
    setValue(type, [...currentValue, { input: "", output: "", explaination: "" }]);
  };

  // Remove item from array
  const removeItem = (type, index) => {
    const currentValue = watch(type);
    const updated = [...currentValue];
    updated.splice(index, 1);
    setValue(type, updated);
  };

  // Update language field
  const updateLanguage = (type, index, value) => {
    const currentValue = watch(type);
    const updated = [...currentValue];
    updated[index] = { ...updated[index], language: value };
    setValue(type, updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading problem data...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Problem Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The problem you're trying to edit doesn't exist.</p>
          <button
            onClick={() => navigate("/admin/update")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Problems List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Update Problem: {problem.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Problem ID: <span className="font-mono text-sm">{problemId}</span>
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/update")}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back to List
            </button>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information - Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title - Full width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description - Full width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  rows="6"
                  {...register("description", { required: "Description is required" })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty *
                </label>
                <select
                  {...register("difficulty", { required: "Difficulty is required" })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.difficulty ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-red-500">{errors.difficulty.message}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  {...register("tags")}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Visible Test Cases */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Visible Test Cases
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Test cases that users can see
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addTestCase("visibleTestCases")}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Test Case
                </button>
              </div>
              
              {watch("visibleTestCases")?.map((testCase, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Test Case {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem("visibleTestCases", index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Input
                        </label>
                        <textarea
                          rows="2"
                          {...register(`visibleTestCases.${index}.input`)}
                          className="w-full px-3 py-2 border rounded font-mono text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Output
                        </label>
                        <textarea
                          rows="2"
                          {...register(`visibleTestCases.${index}.output`)}
                          className="w-full px-3 py-2 border rounded font-mono text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                      </div>
                    </div>
                    {/* Explaination Field */}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Explanation *
                      </label>
                      <textarea
                        rows="2"
                        {...register(`visibleTestCases.${index}.explaination`, { 
                          required: "Explanation is required" 
                        })}
                        className={`w-full px-3 py-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                          errors.visibleTestCases?.[index]?.explaination ? "border-red-500" : ""
                        }`}
                        placeholder="Explain what this test case demonstrates"
                      />
                      {errors.visibleTestCases?.[index]?.explaination && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.visibleTestCases[index].explaination.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Start Code and Reference Solution - Side by Side */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Code Templates
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Start Code Column */}
                <div>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      Starter Code
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code provided to users as starting point
                    </p>
                  </div>
                  
                  {watch("startCode")?.map((code, index) => (
                    <div key={index} className="mb-6 p-4 border rounded-lg bg-blue-50 dark:bg-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <span className="font-bold text-blue-700 dark:text-blue-300 mr-2">
                            Language:
                          </span>
                          <input
                            type="text"
                            value={code.language || ""}
                            onChange={(e) => updateLanguage("startCode", index, e.target.value)}
                            className="px-3 py-1 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            placeholder="e.g., JavaScript, Python"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem("startCode", index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Initial Code
                      </label>
                      <textarea
                        rows="8"
                        {...register(`startCode.${index}.initialCode`)}
                        className="w-full px-3 py-2 border rounded font-mono text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Enter starter code..."
                      />
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setValue("startCode", [...watch("startCode"), { language: "", initialCode: "" }])}
                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add Starter Code
                  </button>
                </div>

                {/* Reference Solution Column */}
                <div>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      Reference Solution
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete solutions that pass all tests
                    </p>
                  </div>
                  
                  {watch("referenceSolution")?.map((solution, index) => (
                    <div key={index} className="mb-6 p-4 border rounded-lg bg-purple-50 dark:bg-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <span className="font-bold text-purple-700 dark:text-purple-300 mr-2">
                            Language:
                          </span>
                          <input
                            type="text"
                            value={solution.language || ""}
                            onChange={(e) => updateLanguage("referenceSolution", index, e.target.value)}
                            className="px-3 py-1 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            placeholder="e.g., JavaScript, Python"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem("referenceSolution", index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Complete Solution
                      </label>
                      <textarea
                        rows="8"
                        {...register(`referenceSolution.${index}.completeCode`)}
                        className="w-full px-3 py-2 border rounded font-mono text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Enter complete solution..."
                      />
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setValue("referenceSolution", [...watch("referenceSolution"), { language: "", completeCode: "" }])}
                    className="w-full px-4 py-3 border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add Reference Solution
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hidden Test Cases
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Test cases used for final evaluation (not visible to users)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addTestCase("hiddenTestCases")}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Hidden Case
                </button>
              </div>
              
              {watch("hiddenTestCases")?.map((testCase, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-yellow-50 dark:bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Hidden Test Case {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem("hiddenTestCases", index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Input
                        </label>
                        <textarea
                          rows="2"
                          {...register(`hiddenTestCases.${index}.input`)}
                          className="w-full px-3 py-2 border rounded font-mono text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Output
                        </label>
                        <textarea
                          rows="2"
                          {...register(`hiddenTestCases.${index}.output`)}
                          className="w-full px-3 py-2 border rounded font-mono text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                      </div>
                    </div>
                    {/* Explaination Field for Hidden Test Cases */}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Explanation *
                      </label>
                      <textarea
                        rows="2"
                        {...register(`hiddenTestCases.${index}.explaination`, { 
                          required: "Explanation is required" 
                        })}
                        className={`w-full px-3 py-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                          errors.hiddenTestCases?.[index]?.explaination ? "border-red-500" : ""
                        }`}
                        placeholder="Explain what this hidden test case demonstrates"
                      />
                      {errors.hiddenTestCases?.[index]?.explaination && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.hiddenTestCases[index].explaination.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="border-t pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Using <span className="font-semibold">PATCH request</span> - only modified fields will be updated</p>
                  <p>Empty fields will be ignored</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/update")}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Update Problem (PATCH)
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Video Information */}
        {problem.secureUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Video Solution (Read-only)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Video URL
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded border break-all">
                  <a 
                    href={problem.secureUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {problem.secureUrl}
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Cloudinary ID
                  </label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded border font-mono text-sm">
                    {problem.cloudinaryPublicId}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Thumbnail Preview
                  </label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded border">
                    <div dangerouslySetInnerHTML={{ __html: problem.thumbnailUrl || '' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUpdateProblem;