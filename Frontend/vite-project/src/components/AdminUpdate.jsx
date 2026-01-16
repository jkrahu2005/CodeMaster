import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { Link } from "react-router";

function AdminUpdate() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/problem/getAllProblem');
                console.log(response);
                setProblems(response.data);
                setError(null);
            } catch (err) {
                console.log("The error is:", err);
                setError(err.message || "Failed to fetch problems");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading problems...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8 max-w-md mx-auto">
                    <div className="text-red-500 dark:text-red-400 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading Problems</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Update Problems
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {problems.length} problem{problems.length !== 1 ? 's' : ''} available for editing
                    </p>
                </div>

                {/* Problems Table */}
                {problems.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">📝</div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            No Problems Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            There are no problems to edit at the moment
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Problem Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Difficulty
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {problems.map((problem, index) => (
                                        <tr 
                                            key={problem._id || problem.id} 
                                            className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                    {problem.title}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {problem.description?.substring(0, 120) || 'No description available'}
                                                    {problem.description?.length > 120 ? '...' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                                    ${problem.difficulty === 'Easy' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                        : problem.difficulty === 'Medium' 
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {problem.difficulty || 'Not Set'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                    {problem.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/admin/update/${problem._id || problem.id}`}
                                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md min-w-[100px]"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                    </svg>
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {problems.map((problem, index) => (
                                <div 
                                    key={problem._id || problem.id} 
                                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                #{index + 1}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                                {problem.title}
                                            </h3>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                            ${problem.difficulty === 'Easy' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                : problem.difficulty === 'Medium' 
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {problem.difficulty || 'Not Set'}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                        {problem.description?.substring(0, 100) || 'No description available'}
                                        {problem.description?.length > 100 ? '...' : ''}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                                            {problem.category || 'Uncategorized'}
                                        </span>
                                        
                                        <Link
                                            to={`/admin/update/${problem._id || problem.id}`}
                                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm min-w-[80px]"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Stats */}
                {problems.length > 0 && (
                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Click "Edit" to modify any problem
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUpdate;