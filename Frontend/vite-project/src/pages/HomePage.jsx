import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle, 
  Circle, 
  ChevronRight,
  User,
  LogOut,
  BarChart3,
  Clock,
  Star,
  Shield,
  Settings,
  LayoutDashboard
} from 'lucide-react';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    sortBy: 'default'
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredAndSortedProblems = useMemo(() => {
    let filtered = problems.filter(problem => {
      // Search filter
      if (searchQuery && !problem.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Difficulty filter
      if (filters.difficulty !== 'all' && problem.difficulty !== filters.difficulty) {
        return false;
      }
      
      // Tag filter
      if (filters.tag !== 'all' && problem.tags !== filters.tag) {
        return false;
      }
      
      // Status filter
      if (filters.status === 'solved') {
        return solvedProblems.some(sp => sp._id === problem._id);
      } else if (filters.status === 'unsolved') {
        return !solvedProblems.some(sp => sp._id === problem._id);
      }
      
      return true;
    });

    // Sorting
    switch (filters.sortBy) {
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [problems, solvedProblems, filters, searchQuery]);

  const difficultyStats = useMemo(() => {
    const stats = { easy: 0, medium: 0, hard: 0, total: problems.length };
    problems.forEach(problem => {
      if (stats.hasOwnProperty(problem.difficulty.toLowerCase())) {
        stats[problem.difficulty.toLowerCase()]++;
      }
    });
    return stats;
  }, [problems]);

  const solvedCount = solvedProblems.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
      {/* Enhanced Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-6 sticky top-0 z-50">
        <div className="flex-1">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CodeMaster
            </span>
          </NavLink>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-base-content/70">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Solved: {solvedCount}/{problems.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-success gap-1">
                <CheckCircle className="h-3 w-3" />
                {difficultyStats.easy}
              </div>
              <div className="badge badge-warning gap-1">
                <Clock className="h-3 w-3" />
                {difficultyStats.medium}
              </div>
              <div className="badge badge-error gap-1">
                <Star className="h-3 w-3" />
                {difficultyStats.hard}
              </div>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="avatar placeholder">
              <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-full w-10 h-10 flex items-center justify-center ring-2 ring-primary/20">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </div>
            </div>
            <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-64 mt-4">
              <li className="menu-title">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-full w-12 h-12">
                      <span className="text-lg">{user?.firstName?.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold">{user?.firstName}</p>
                    <p className="text-sm text-base-content/70">{user?.emailId}</p>
                  </div>
                </div>
              </li>
              <div className="divider my-1"></div>
              
              {/* Admin Link - Enhanced with Icon */}
              {user?.role === 'admin' && (
                <>
                  <li>
                    <NavLink 
                      to="/admin" 
                      className="flex items-center gap-3 text-primary hover:bg-primary/10 transition-colors group"
                    >
                      <div className="relative">
                        <Shield className="h-4 w-4" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      </div>
                      <span>Admin Dashboard</span>
                      <div className="ml-auto">
                        <div className="badge badge-primary badge-sm">Admin</div>
                      </div>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink 
                      to="/admin/problems" 
                      className="flex items-center gap-3 text-base-content hover:bg-base-200 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Manage Problems</span>
                    </NavLink>
                  </li>
                  <div className="divider my-1"></div>
                </>
              )}
              
              <li>
                <a className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4" />
                  <span>Progress</span>
                  <div className="badge badge-primary ml-auto">{solvedCount}</div>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </a>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-error hover:bg-error/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Admin Access Badge for Admins */}
        {user?.role === 'admin' && (
          <div className="mb-6">
            <div className="alert alert-info shadow-lg bg-gradient-to-r from-info/10 to-info/5 border-info/20">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-info" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Administrator Access</span>
                    <div className="badge badge-info badge-sm">Admin</div>
                  </div>
                  <p className="text-sm opacity-80">
                    You have access to administrative features. Manage problems, users, and system settings.
                  </p>
                </div>
                <NavLink to="/admin" className="btn btn-info btn-sm gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </NavLink>
              </div>
            </div>
          </div>
        )}

        {/* Header Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stats shadow bg-gradient-to-br from-base-100 to-base-200 border border-base-300">
            <div className="stat">
              <div className="stat-figure text-primary">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="stat-title">Total Problems</div>
              <div className="stat-value">{problems.length}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-br from-base-100 to-base-200 border border-base-300">
            <div className="stat">
              <div className="stat-figure text-success">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="stat-title">Solved</div>
              <div className="stat-value">{solvedCount}</div>
              <div className="stat-desc">{problems.length > 0 ? `${Math.round((solvedCount / problems.length) * 100)}% completion` : '0%'}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-br from-base-100 to-base-200 border border-base-300">
            <div className="stat">
              <div className="stat-figure text-warning">
                <Clock className="h-8 w-8" />
              </div>
              <div className="stat-title">In Progress</div>
              <div className="stat-value">{problems.length - solvedCount}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-br from-base-100 to-base-200 border border-base-300">
            <div className="stat">
              <div className="stat-figure text-info">
                <Star className="h-8 w-8" />
              </div>
              <div className="stat-title">Success Rate</div>
              <div className="stat-value">{problems.length > 0 ? `${Math.round((solvedCount / problems.length) * 100)}%` : '0%'}</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 bg-base-100 rounded-2xl shadow-lg p-6 border border-base-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Filter className="h-6 w-6 text-primary" />
              Filter Problems
            </h2>
            <div className="text-sm text-base-content/70">
              Showing {filteredAndSortedProblems.length} of {problems.length} problems
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Search Problems</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search by problem title..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Status</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Difficulty</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Sort By</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="default">Default</option>
                <option value="difficulty">Difficulty</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button 
              onClick={() => setFilters({difficulty: 'easy', tag: 'all', status: 'all', sortBy: 'default'})}
              className="btn btn-sm btn-success gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Easy Only
            </button>
            <button 
              onClick={() => setFilters({difficulty: 'all', tag: 'all', status: 'solved', sortBy: 'default'})}
              className="btn btn-sm btn-primary gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Solved Only
            </button>
            <button 
              onClick={() => setFilters({difficulty: 'all', tag: 'all', status: 'unsolved', sortBy: 'default'})}
              className="btn btn-sm btn-warning gap-1"
            >
              <Circle className="h-3 w-3" />
              Unsolved Only
            </button>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilters({difficulty: 'all', tag: 'all', status: 'all', sortBy: 'default'});
              }}
              className="btn btn-sm btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Problems Grid */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl skeleton h-32"></div>
            ))}
          </div>
        ) : filteredAndSortedProblems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-base-300 flex items-center justify-center">
              <Search className="h-12 w-12 text-base-content/30" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No problems found</h3>
            <p className="text-base-content/70 mb-6">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilters({difficulty: 'all', tag: 'all', status: 'all', sortBy: 'default'});
              }}
              className="btn btn-primary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedProblems.map(problem => (
              <ProblemCard 
                key={problem._id}
                problem={problem}
                isSolved={solvedProblems.some(sp => sp._id === problem._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProblemCard({ problem, isSolved }) {
  const difficultyColors = {
    easy: 'from-success/20 to-success/5 border-success/20',
    medium: 'from-warning/20 to-warning/5 border-warning/20',
    hard: 'from-error/20 to-error/5 border-error/20'
  };

  return (
    <NavLink to={`/problem/${problem._id}`}>
      <div className={`card bg-gradient-to-br ${difficultyColors[problem.difficulty.toLowerCase()] || 'from-base-200 to-base-100'} border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}>
        <div className="card-body p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="card-title text-lg font-bold group-hover:text-primary transition-colors">
                  {problem.title}
                </h3>
                {isSolved && (
                  <div className="badge badge-success gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Solved
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`badge badge-lg ${getDifficultyBadgeColor(problem.difficulty)} font-bold`}>
                  {problem.difficulty}
                </div>
                <div className="badge badge-outline badge-lg">
                  {problem.tags}
                </div>
              </div>
              
              <div className="text-sm text-base-content/70">
                <p className="line-clamp-2">
                  {problem.description || 'No description available'}
                </p>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          
          <div className="card-actions justify-between items-center mt-4 pt-4 border-t border-base-300/30">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-base-content/60">Acceptance:</span>
                <span className="font-semibold">{problem.acceptanceRate || 'N/A'}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base-content/60">Attempts:</span>
                <span className="font-semibold">{problem.attempts || '0'}</span>
              </div>
            </div>
            
            <button className="btn btn-sm btn-primary btn-outline">
              Start Solving
            </button>
          </div>
        </div>
      </div>
    </NavLink>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;