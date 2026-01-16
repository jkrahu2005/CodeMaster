import { useEffect, useState, useMemo } from 'react';
import axiosClient from '../utils/axiosClient';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  Download, 
  Upload, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle,
  BarChart3,
  Tag,
  Hash,
  Clock,
  Shield,
  FileText,
  Copy,
  X,
  Check,
  ExternalLink,
  MoreVertical,
  Layers,
  PieChart,
  TrendingUp,
  Users,
  Code,
  FileCode,
  Terminal
} from 'lucide-react';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPreview, setShowPreview] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [deletedProblems, setDeletedProblems] = useState([]);
  const [showRecovery, setShowRecovery] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [bulkAction, setBulkAction] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [stats, setStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    byTag: {}
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [problems]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: problems.length,
      easy: 0,
      medium: 0,
      hard: 0,
      byTag: {}
    };

    problems.forEach(problem => {
      switch(problem.difficulty?.toLowerCase()) {
        case 'easy': stats.easy++; break;
        case 'medium': stats.medium++; break;
        case 'hard': stats.hard++; break;
      }

      if (problem.tags) {
        stats.byTag[problem.tags] = (stats.byTag[problem.tags] || 0) + 1;
      }
    });

    setStats(stats);
  };

  const filteredProblems = useMemo(() => {
    let filtered = problems.filter(problem => {
      if (searchQuery && !problem.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      if (filters.difficulty !== 'all' && problem.difficulty !== filters.difficulty) {
        return false;
      }
      
      if (filters.tag !== 'all' && problem.tags !== filters.tag) {
        return false;
      }
      
      return true;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [problems, searchQuery, filters, sortConfig]);

  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProblems.slice(startIndex, startIndex + pageSize);
  }, [filteredProblems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProblems.length / pageSize);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedProblems.length === paginatedProblems.length) {
      setSelectedProblems([]);
    } else {
      setSelectedProblems(paginatedProblems.map(p => p._id));
    }
  };

  const handleSelectProblem = (id) => {
    setSelectedProblems(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    try {
      const problemToDelete = problems.find(p => p._id === id);
      await axiosClient.delete(`/problem/delete/${id}`);
      
      setDeletedProblems(prev => [...prev, {
        ...problemToDelete,
        deletedAt: new Date().toISOString()
      }]);
      
      setProblems(prev => prev.filter(problem => problem._id !== id));
      setSelectedProblems(prev => prev.filter(pid => pid !== id));
      
      showToast('Problem deleted successfully', 'success');
      
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
      showToast('Failed to delete problem', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedProblems.length || !window.confirm(`Delete ${selectedProblems.length} selected problems?`)) return;
    
    try {
      for (const id of selectedProblems) {
        const problemToDelete = problems.find(p => p._id === id);
        await axiosClient.delete(`/problem/delete/${id}`);
        
        setDeletedProblems(prev => [...prev, {
          ...problemToDelete,
          deletedAt: new Date().toISOString()
        }]);
      }
      
      setProblems(prev => prev.filter(p => !selectedProblems.includes(p._id)));
      setSelectedProblems([]);
      showToast(`${selectedProblems.length} problems deleted successfully`, 'success');
      
    } catch (err) {
      setError('Failed to delete problems');
      console.error(err);
      showToast('Failed to delete problems', 'error');
    }
  };

  const handleRecover = async (id) => {
    try {
      const problemToRecover = deletedProblems.find(p => p._id === id);
      setProblems(prev => [...prev, problemToRecover]);
      setDeletedProblems(prev => prev.filter(p => p._id !== id));
      showToast('Problem recovered successfully', 'success');
    } catch (err) {
      showToast('Failed to recover problem', 'error');
    }
  };

  const handleExport = () => {
    const dataToExport = selectedProblems.length > 0 
      ? problems.filter(p => selectedProblems.includes(p._id))
      : filteredProblems;
    
    let dataStr, fileExtension;
    
    if (exportFormat === 'json') {
      dataStr = JSON.stringify(dataToExport, null, 2);
      fileExtension = 'json';
    } else {
      const headers = ['Title', 'Difficulty', 'Tags', 'Description'];
      const csvRows = dataToExport.map(p => [
        `"${p.title}"`,
        p.difficulty,
        p.tags,
        `"${p.description?.replace(/"/g, '""') || ''}"`
      ]);
      dataStr = [headers, ...csvRows].map(row => row.join(',')).join('\n');
      fileExtension = 'csv';
    }
    
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `problems_export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast(`Exported ${dataToExport.length} problems`, 'success');
  };

  const showToast = (message, type = 'info') => {
    // Implement proper toast system
    console.log(`${type}: ${message}`);
  };

  // Enhanced color functions with better contrast
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500 text-emerald-950';
      case 'medium': return 'bg-amber-500 text-amber-950';
      case 'hard': return 'bg-rose-500 text-rose-950';
      default: return 'bg-slate-500 text-slate-950';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hard': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDifficultyTextColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-700';
      case 'medium': return 'text-amber-700';
      case 'hard': return 'text-rose-700';
      default: return 'text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            <RefreshCw className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-lg font-medium text-slate-700">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Problem Management Dashboard
                </h1>
                <p className="text-sm text-slate-600">Admin panel for managing coding problems</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProblems}
                className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-50 text-slate-700 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              
              {deletedProblems.length > 0 && (
                <button
                  onClick={() => setShowRecovery(true)}
                  className="btn btn-sm bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Recovery ({deletedProblems.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-white shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1">Total Problems</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Hash className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-500">Difficulty Breakdown</div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getDifficultyTextColor('easy')}`}>{stats.easy}</div>
                      <div className="text-xs text-slate-500">Easy</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getDifficultyTextColor('medium')}`}>{stats.medium}</div>
                      <div className="text-xs text-slate-500">Medium</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getDifficultyTextColor('hard')}`}>{stats.hard}</div>
                      <div className="text-xs text-slate-500">Hard</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-amber-50">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1">Unique Tags</div>
                  <div className="text-2xl font-bold text-slate-900">{Object.keys(stats.byTag).length}</div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    Most common: {Object.entries(stats.byTag).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-full bg-emerald-50">
                  <Tag className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1">Selected Items</div>
                  <div className="text-2xl font-bold text-slate-900">{selectedProblems.length}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {selectedProblems.length > 0 ? 'Ready for bulk action' : 'Select items'}
                  </div>
                </div>
                <div className="p-3 rounded-full bg-rose-50">
                  <CheckSquare className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="card bg-white shadow-md border border-slate-200 mb-6">
          <div className="card-body p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search problems by title..."
                    className="input input-bordered w-full pl-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <select 
                    className="select select-bordered select-sm border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={filters.difficulty}
                    onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  <select 
                    className="select select-bordered select-sm border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={filters.tag}
                    onChange={(e) => setFilters({...filters, tag: e.target.value})}
                  >
                    <option value="all">All Tags</option>
                    {Object.keys(stats.byTag).map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>

                  <div className="join border border-slate-300 rounded-lg overflow-hidden">
                    <button 
                      className={`join-item btn btn-sm px-4 ${viewMode === 'table' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => setViewMode('table')}
                    >
                      Table
                    </button>
                    <button 
                      className={`join-item btn btn-sm px-4 ${viewMode === 'card' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => setViewMode('card')}
                    >
                      Cards
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="form-control">
                      <label className="label cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary border-slate-400"
                          checked={selectedProblems.length === paginatedProblems.length && paginatedProblems.length > 0}
                          onChange={handleSelectAll}
                        />
                        <span className="label-text text-slate-700">Select All</span>
                      </label>
                    </div>

                    <div className="dropdown dropdown-bottom">
                      <label tabIndex={0} className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-50 text-slate-700 gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </label>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-lg w-52 border border-slate-200">
                        <li>
                          <button onClick={handleExport} className="text-slate-700 hover:bg-slate-50">
                            <FileText className="h-4 w-4 text-slate-500" />
                            Export as JSON
                          </button>
                        </li>
                        <li>
                          <button onClick={() => {
                            setExportFormat('csv');
                            setTimeout(handleExport, 100);
                          }} className="text-slate-700 hover:bg-slate-50">
                            <Copy className="h-4 w-4 text-slate-500" />
                            Export as CSV
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {selectedProblems.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedProblems.length})
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-medium">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredProblems.length)} of {filteredProblems.length} problems
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Show:</span>
                    <select 
                      className="select select-bordered select-xs border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'table' ? (
          <div className="card bg-white shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-12 bg-slate-50">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm border-slate-400"
                        checked={selectedProblems.length === paginatedProblems.length && paginatedProblems.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="bg-slate-50 font-semibold text-slate-700">
                      <button 
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort('title')}
                      >
                        Title
                        {sortConfig.key === 'title' && (
                          <span className={`text-blue-600 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`}>▼</span>
                        )}
                      </button>
                    </th>
                    <th className="bg-slate-50 font-semibold text-slate-700">
                      <button 
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => handleSort('difficulty')}
                      >
                        Difficulty
                        {sortConfig.key === 'difficulty' && (
                          <span className={`text-blue-600 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`}>▼</span>
                        )}
                      </button>
                    </th>
                    <th className="bg-slate-50 font-semibold text-slate-700">Tags</th>
                    <th className="bg-slate-50 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProblems.map((problem) => (
                    <tr key={problem._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm border-slate-400"
                          checked={selectedProblems.includes(problem._id)}
                          onChange={() => handleSelectProblem(problem._id)}
                        />
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800">{problem.title}</div>
                        <div className="text-sm text-slate-600 line-clamp-1">
                          {problem.description || 'No description'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge font-medium ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <span className="badge bg-slate-100 text-slate-700 border-slate-300">
                            {problem.tags}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowPreview(problem)}
                            className="btn btn-xs btn-outline border-slate-300 hover:bg-slate-50 text-slate-700 gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </button>
                          <button
                            onClick={() => setShowConfirmDelete(problem)}
                            className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-white gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProblems.map((problem) => (
              <div key={problem._id} className="card bg-white shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all">
                <div className="card-body p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm border-slate-400"
                          checked={selectedProblems.includes(problem._id)}
                          onChange={() => handleSelectProblem(problem._id)}
                        />
                        <h3 className="font-bold text-slate-900 line-clamp-1">
                          {problem.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`badge ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="badge bg-slate-100 text-slate-700 border-slate-300">
                          {problem.tags}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                        {problem.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="card-actions justify-between items-center">
                    <div className="text-xs text-slate-500 font-mono">
                      ID: {problem._id.slice(-8)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPreview(problem)}
                        className="btn btn-xs btn-outline border-slate-300 hover:bg-slate-50 text-slate-700"
                        title="Preview"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(problem)}
                        className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-white"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            <div className="join border border-slate-300 rounded-lg overflow-hidden">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`join-item btn btn-sm px-4 ${currentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal - IMPROVED FOR VISIBILITY */}
      {showPreview && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <FileCode className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Problem Preview</h3>
                  <p className="text-sm text-slate-500">View problem details</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(null)} 
                className="btn btn-sm btn-circle btn-outline border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Title Section */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Problem Title
                </h4>
                <p className="text-lg font-medium text-slate-900 bg-white p-3 rounded border border-slate-200">
                  {showPreview.title}
                </p>
              </div>
              
              {/* Description Section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h4>
                <div className="bg-white p-4 rounded border border-slate-200">
                  <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                    {showPreview.description || 'No description provided.'}
                  </pre>
                </div>
              </div>
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty */}
                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                  <h4 className="font-semibold text-emerald-800 mb-2">Difficulty</h4>
                  <div className={`badge ${getDifficultyBadge(showPreview.difficulty)} text-lg font-medium px-4 py-2`}>
                    {showPreview.difficulty}
                  </div>
                </div>
                
                {/* Tags */}
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                  <h4 className="font-semibold text-amber-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-amber-100 text-amber-800 border-amber-300 px-3 py-2 font-medium">
                      {showPreview.tags || 'No tags'}
                    </span>
                  </div>
                </div>
                
                {/* Problem ID */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Problem ID</h4>
                  <div className="bg-white p-3 rounded border border-slate-300">
                    <code className="font-mono text-sm text-slate-700 break-all">
                      {showPreview._id}
                    </code>
                  </div>
                </div>
              </div>
              
              {/* Additional Info Section */}
              {showPreview.visibleTestCases && showPreview.visibleTestCases.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Example Test Cases ({showPreview.visibleTestCases.length})
                  </h4>
                  <div className="space-y-3">
                    {showPreview.visibleTestCases.slice(0, 2).map((testCase, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="font-medium text-slate-600 mb-1">Input:</div>
                            <pre className="bg-slate-100 p-2 rounded text-slate-800 overflow-x-auto">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <div className="font-medium text-slate-600 mb-1">Output:</div>
                            <pre className="bg-slate-100 p-2 rounded text-slate-800 overflow-x-auto">
                              {testCase.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-action mt-6 pt-4 border-t border-slate-200">
              <button 
                onClick={() => setShowPreview(null)} 
                className="btn btn-outline border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal - IMPROVED VISIBILITY */}
      {showConfirmDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-rose-100">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Confirm Deletion</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-rose-800">Warning: You are about to delete</p>
                    <p className="text-rose-700 font-semibold mt-1">{showConfirmDelete.title}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Problem Details</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Difficulty:</span>
                    <span className={`badge ${getDifficultyBadge(showConfirmDelete.difficulty)}`}>
                      {showConfirmDelete.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tags:</span>
                    <span className="badge bg-slate-100 text-slate-700 border-slate-300">
                      {showConfirmDelete.tags}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mt-3">
                    <span className="font-medium">ID:</span>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 break-all">
                      {showConfirmDelete._id}
                    </code>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-action mt-6">
              <button 
                onClick={() => setShowConfirmDelete(null)} 
                className="btn btn-outline border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleDelete(showConfirmDelete._id);
                  setShowConfirmDelete(null);
                }} 
                className="btn bg-rose-600 hover:bg-rose-700 text-white gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Problem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Bin Modal */}
      {showRecovery && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Trash2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Recovery Bin</h3>
                  <p className="text-sm text-slate-500">Recently deleted problems ({deletedProblems.length})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRecovery(false)} 
                className="btn btn-sm btn-circle btn-outline border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {deletedProblems.map((problem) => (
                <div key={problem._id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-slate-900">{problem.title}</h4>
                        <span className={`badge ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="badge bg-slate-100 text-slate-700 border-slate-300">
                          {problem.tags}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Deleted on: {new Date(problem.deletedAt).toLocaleString()} • 
                        ID: <code className="ml-1 bg-slate-100 px-1 py-0.5 rounded">{problem._id.slice(-8)}</code>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRecover(problem._id)}
                      className="btn btn-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 gap-2 ml-4"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Recover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="modal-action mt-6 pt-4 border-t border-slate-200">
              <button 
                onClick={() => setDeletedProblems([])}
                className="btn btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                disabled={deletedProblems.length === 0}
              >
                Empty Recovery Bin
              </button>
              <button 
                onClick={() => setShowRecovery(false)} 
                className="btn btn-outline border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDelete;