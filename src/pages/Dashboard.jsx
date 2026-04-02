import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FaArrowUp, FaArrowDown, FaWallet, FaPlus, FaCloudUploadAlt, FaGasPump, FaHome, FaBolt, FaShoppingBag, FaBoxOpen, FaUniversity, FaFilm, FaGamepad, FaGraduationCap, FaPlane, FaUtensils, FaHospital, FaUser, FaCalendarAlt, FaChevronDown, FaRocket } from 'react-icons/fa';
import { transactionAPI, categoryAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageTransition, StaggerContainer, AnimatedItem } from '../components/common/PageTransition';
import ThemeToggle from '../components/common/ThemeToggle';
import './Dashboard.css';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Dashboard = () => {
    const navigate = useNavigate();
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();

    const [allTransactions, setAllTransactions] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Month filter: defaults to current month (fresh start each month)
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);

    // New Month popup
    const [showNewMonthPopup, setShowNewMonthPopup] = useState(false);

    // Check if we should show the "New Month, New Flow" popup
    useEffect(() => {
        const popupKey = `new_month_popup_${currentYear}_${currentMonth}`;
        const alreadyShown = localStorage.getItem(popupKey);
        if (!alreadyShown) {
            setShowNewMonthPopup(true);
            localStorage.setItem(popupKey, 'true');
        }
    }, [currentYear, currentMonth]);

    // Filter transactions based on view mode
    const filterTransactions = (txArray) => {
        if (viewMode === 'year') {
            return txArray.filter(tx => {
                const d = new Date(tx.occurred_at || tx.created_at);
                return d.getFullYear() === selectedYear;
            });
        }
        // month mode
        return txArray.filter(tx => {
            const d = new Date(tx.occurred_at || tx.created_at);
            return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });
    };

    // Get available months that have data
    const getAvailableMonths = () => {
        const months = new Set();
        allTransactions.forEach(tx => {
            const d = new Date(tx.occurred_at || tx.created_at);
            if (d.getFullYear() === selectedYear) {
                months.add(d.getMonth());
            }
        });
        // Always include the current month
        months.add(currentMonth);
        return Array.from(months).sort((a, b) => b - a);
    };

    // Get available years
    const getAvailableYears = () => {
        const years = new Set();
        allTransactions.forEach(tx => {
            const d = new Date(tx.occurred_at || tx.created_at);
            if (!isNaN(d.getTime())) years.add(d.getFullYear());
        });
        years.add(currentYear);
        return Array.from(years).sort((a, b) => b - a);
    };

    // Category icon mapping
    const getCategoryIcon = (nameOrIcon) => {
        const iconMap = {
            'Fuel': <FaGasPump />,
            'Transfer': <FaUniversity />,
            'Utilities': <FaBolt />,
            'Groceries': <FaShoppingBag />,
            'Housing': <FaHome />,
            'Food': <FaUtensils />,
            'Hospital': <FaHospital />,
            'Entertainment': <FaFilm />,
            'Gaming': <FaGamepad />,
            'Education': <FaGraduationCap />,
            'Travel': <FaPlane />,
            'Other': <FaBoxOpen />,
        };
        return iconMap[nameOrIcon] || <FaBoxOpen />;
    };

    // Category color mapping (Premium iOS Palettes)
    const getCategoryColor = (name) => {
        const colorMap = {
            'Fuel': '#007AFF',      // iOS Blue
            'Transfer': '#34C759',  // iOS Green
            'Utilities': '#FF9F0A', // iOS Orange
            'Groceries': '#FF2D55', // iOS Pink
            'Food': '#FF375F',      // iOS Rose
            'Hospital': '#AF52DE',  // iOS Purple
            'Housing': '#5856D6',   // iOS Indigo
            'Entertainment': '#5856D6', // iOS Indigo
            'Other': '#8E8E93',     // iOS Gray
        };
        return colorMap[name] || '#8E8E93';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [txData, catData] = await Promise.all([
                    transactionAPI.getAll(),
                    categoryAPI.getAll()
                ]);
                // Defensive check to ensure we always have an array
                const txArray = Array.isArray(txData.transactions) ? txData.transactions : (Array.isArray(txData) ? txData : []);
                setAllTransactions(txArray);
                setTransactions(filterTransactions(txArray));
                setCategories(catData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-filter whenever view mode, month, or year changes
    useEffect(() => {
        if (allTransactions.length > 0) {
            setTransactions(filterTransactions(allTransactions));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, selectedMonth, selectedYear]);

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name : 'Uncategorized';
    };

    const getTransactionCategoryName = (tx) => {
        if (tx?.category?.name) return tx.category.name;
        if (typeof tx?.category === 'string') return tx.category;
        return getCategoryName(tx?.category_id);
    };

    // New helper to get category icon including backend icons
    const renderCategoryIcon = (tx) => {
        const category = categories.find(c => c.id === tx.category_id) || tx.category;
        const categoryName = getTransactionCategoryName(tx);

        // Priority: Backend icon -> mapping via name -> fallback
        if (category && category.icon) {
            return getCategoryIcon(category.icon);
        }
        return getCategoryIcon(categoryName);
    };

    const getEffectiveTransactionType = (tx) => {
        // Always respect the actual transaction_type stored on the transaction
        return tx.transaction_type || 'expense';
    };

    // Calculate spending breakdown by category
    const calculatePieData = () => {
        const spending = {};
        transactions.forEach(tx => {
            if (getEffectiveTransactionType(tx) === 'expense') {
                const catName = getTransactionCategoryName(tx) || 'Other';
                spending[catName] = (spending[catName] || 0) + parseFloat(tx.amount || 0);
            }
        });

        return Object.entries(spending)
            .map(([name, value]) => ({
                name,
                value,
                color: getCategoryColor(name)
            }))
            .sort((a, b) => b.value - a.value); // Sort by value for cleaner look
    };

    // Get recent transactions (last 4)
    const recentTransactions = transactions.slice(0, 4);

    // Calculate totals
    const expenseTransactions = transactions
        .filter(tx => getEffectiveTransactionType(tx) === 'expense');
    const incomeTransactions = transactions
        .filter(tx => getEffectiveTransactionType(tx) === 'income');

    const totalExpenses = expenseTransactions
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const totalIncome = incomeTransactions
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const balance = totalIncome - totalExpenses;

    const pieData = calculatePieData();
    const totalSpent = pieData.reduce((sum, item) => sum + item.value, 0);

    if (loading) {
        return (
            <div className="dashboard-container">
                <LoadingSpinner variant="skeleton" />
            </div>
        );
    }

    const viewLabel = viewMode === 'year'
        ? `All of ${selectedYear}`
        : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

    return (
        <PageTransition>
            <div className="dashboard-container">
                {/* ===== New Month, New Flow Popup ===== */}
                <AnimatePresence>
                    {showNewMonthPopup && (
                        <motion.div
                            className="new-month-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewMonthPopup(false)}
                        >
                            <motion.div
                                className="new-month-popup"
                                initial={{ opacity: 0, scale: 0.7, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="new-month-icon">
                                    <FaRocket />
                                </div>
                                <h2>New Month, New Flow 🚀</h2>
                                <p>It&apos;s <strong>{MONTH_NAMES[currentMonth]} {currentYear}</strong>! Your dashboard has been reset for a fresh start. Time to set new goals and crush them!</p>
                                <motion.button
                                    className="btn btn-primary lg new-month-btn"
                                    onClick={() => setShowNewMonthPopup(false)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    Let&apos;s Go!
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <StaggerContainer>
                    <AnimatedItem>
                        <header className="flex-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">Dashboard</h1>
                                <span className="dashboard-period-label">
                                    <FaCalendarAlt /> {viewLabel}
                                </span>
                            </div>
                            <div className="flex-center gap-4">
                                {/* ===== Month Filter Controls ===== */}
                                <div className="month-filter-bar">
                                    <motion.button
                                        className={`month-filter-btn ${viewMode === 'year' ? 'active' : ''}`}
                                        onClick={() => {
                                            setViewMode(viewMode === 'year' ? 'month' : 'year');
                                            if (viewMode === 'month') {
                                                // switching TO year view
                                            } else {
                                                setSelectedMonth(currentMonth);
                                            }
                                        }}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        {viewMode === 'year' ? 'This Month' : 'All Year'}
                                    </motion.button>

                                    <div className="month-dropdown-wrapper">
                                        <motion.button
                                            className="month-dropdown-trigger"
                                            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                            whileHover={{ y: -1 }}
                                            whileTap={{ scale: 0.96 }}
                                        >
                                            {MONTH_NAMES[selectedMonth].substring(0, 3)} <FaChevronDown className={`chevron-icon ${showMonthDropdown ? 'open' : ''}`} />
                                        </motion.button>

                                        <AnimatePresence>
                                            {showMonthDropdown && (
                                                <motion.div
                                                    className="month-dropdown-menu"
                                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                    transition={{ duration: 0.18 }}
                                                >
                                                    {getAvailableYears().map(year => (
                                                        <div key={year} className="month-dropdown-year-group">
                                                            <div className="month-dropdown-year-label">{year}</div>
                                                            <div className="month-dropdown-grid">
                                                                {MONTH_NAMES.map((name, idx) => {
                                                                    const isActive = selectedMonth === idx && selectedYear === year && viewMode === 'month';
                                                                    const isCurrent = idx === currentMonth && year === currentYear;
                                                                    return (
                                                                        <button
                                                                            key={idx}
                                                                            className={`month-dropdown-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                                                                            onClick={() => {
                                                                                setSelectedMonth(idx);
                                                                                setSelectedYear(year);
                                                                                setViewMode('month');
                                                                                setShowMonthDropdown(false);
                                                                            }}
                                                                        >
                                                                            {name.substring(0, 3)}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <ThemeToggle variant="icon-only" />
                                <div className="profile-icon-circle" onClick={() => navigate('/settings')}>
                                    <FaUser />
                                </div>
                            </div>
                        </header>
                    </AnimatedItem>

                    {/* Banner Section */}
                    <AnimatedItem>
                        <div className="card banner-card mb-8">
                            <div className="banner-content">
                                {/* <div className="banner-icon"><FaMagic /></div> */}
                                <div>
                                    <h4 className="banner-subtitle">SMART CATEGORIZATION</h4>
                                    <h2>Automate your finances</h2>
                                    <p>Upload your latest bank statement or snap a picture of a receipt. Our engine will automatically categorize your spending.</p>
                                </div>
                            </div>
                            <div className="banner-actions">
                                <motion.button
                                    className="btn btn-primary lg"
                                    onClick={() => navigate('/upload')}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <FaCloudUploadAlt /> Upload Bank Transfer
                                </motion.button>
                                <motion.button
                                    className="btn btn-secondary lg"
                                    onClick={() => navigate('/transactions/new')}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <FaPlus /> Manual Entry
                                </motion.button>
                            </div>
                        </div>
                    </AnimatedItem>

                    {/* Summary Cards */}
                    <AnimatedItem>
                        <div className="grid-3 mb-8">
                            <motion.div
                                className="card summary-card"
                                onClick={() => navigate('/accounts')}
                                whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="flex-between mb-4">
                                    <div className="icon-box blue"><FaWallet /></div>
                                    <span className={`badge ${balance >= 0 ? 'green' : 'red'}`}>
                                        {balance >= 0 ? '+' : ''}{((balance / Math.max(totalIncome, 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="card-content">
                                    <p>Net Balance</p>
                                    <h3>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    <span className="sub-text">Based on {transactions.length} transactions</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="card summary-card"
                                onClick={() => navigate('/reports')}
                                whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="flex-between mb-4">
                                    <div className="icon-box green"><FaArrowUp /></div>
                                    <span className="badge green">Income</span>
                                </div>
                                <div className="card-content">
                                    <p>Total Income</p>
                                    <h3>${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    <span className="sub-text">{incomeTransactions.length} income transactions</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="card summary-card"
                                onClick={() => navigate('/reports')}
                                whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="flex-between mb-4">
                                    <div className="icon-box orange"><FaArrowDown /></div>
                                    <span className="badge red">Expenses</span>
                                </div>
                                <div className="card-content">
                                    <p>Total Spending</p>
                                    <h3>${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    <span className="sub-text">{expenseTransactions.length} expense transactions</span>
                                </div>
                            </motion.div>
                        </div>
                    </AnimatedItem>

                    <AnimatedItem>
                        <div className="grid-main-split">
                            {/* Spending Breakdown */}
                            <div className="card breakdown-card">
                                <div className="flex-between mb-6">
                                    <h3 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Spending Breakdown</h3>
                                    <button className="btn-icon" onClick={() => navigate('/categories')}>View All</button>
                                </div>
                                <div className="pie-chart-wrapper flex-center" style={{ position: 'relative' }}>
                                    {pieData.length > 0 ? (
                                        <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <defs>
                                                        {pieData.map((entry, index) => (
                                                            <filter key={`filter-${index}`} id={`shadow-${index}`}>
                                                                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                                                                <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
                                                                <feFlood floodColor={entry.color} floodOpacity="0.2" result="offsetColor" />
                                                                <feComposite in="offsetColor" in2="offsetBlur" operator="in" />
                                                                <feMerge>
                                                                    <feMergeNode />
                                                                    <feMergeNode in="SourceGraphic" />
                                                                </feMerge>
                                                            </filter>
                                                        ))}
                                                    </defs>
                                                    <Pie
                                                        data={pieData}
                                                        innerRadius={78}
                                                        outerRadius={94}
                                                        paddingAngle={6}
                                                        dataKey="value"
                                                        stroke="none"
                                                        cornerRadius={12}
                                                        animationBegin={0}
                                                        animationDuration={1200}
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.color}
                                                                style={{ filter: `url(#shadow-${index})` }}
                                                            />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                textAlign: 'center',
                                                pointerEvents: 'none'
                                            }}>
                                                <div style={{
                                                    fontSize: '22px',
                                                    fontWeight: 800,
                                                    letterSpacing: '-0.03em',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                                <div style={{
                                                    fontSize: '9px',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.08em',
                                                    color: 'var(--text-tertiary)',
                                                    marginTop: '2px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Total Spent
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No spending data yet</p>
                                    )}
                                </div>
                                <div className="legend-list">
                                    {pieData.slice(0, 5).map((item) => (
                                        <div key={item.name} className="legend-row">
                                            <div className="flex-center gap-3">
                                                <span className="dot" style={{
                                                    backgroundColor: item.color,
                                                    boxShadow: `0 0 10px ${item.color}33`
                                                }}></span>
                                                <span style={{ fontWeight: 500, fontSize: '0.82rem' }}>{item.name}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                                                    ${item.value.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                                                    {((item.value / totalSpent) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <motion.button
                                        className="btn btn-secondary w-full"
                                        onClick={() => navigate('/categories')}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        View Details
                                    </motion.button>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="card">
                                <div className="flex-between mb-6">
                                    <h3>Recent Transactions</h3>
                                    <motion.button
                                        className="btn btn-secondary sm"
                                        onClick={() => navigate('/transactions')}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        View All
                                    </motion.button>
                                </div>

                                <table className="table-clean">
                                    <thead>
                                        <tr>
                                            <th>TRANSACTION</th>
                                            <th>CATEGORY</th>
                                            <th>STATUS</th>
                                            <th className="text-right">AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((tx, index) => {
                                            const categoryName = getTransactionCategoryName(tx);
                                            const isIncome = getEffectiveTransactionType(tx) === 'income';
                                            // Infer status from category presence if status field is missing
                                            const isProcessed = tx.status === 'processed' || !!tx.category;

                                            return (
                                                <motion.tr
                                                    key={tx.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.06, duration: 0.3 }}
                                                >
                                                    <td>
                                                        <div className="flex-center gap-3 justify-start">
                                                            <div className="icon-circle-gray">{renderCategoryIcon(tx)}</div>
                                                            <div>
                                                                <div className="font-semibold text-dark">{tx.vendor || tx.description || 'Transaction'}</div>
                                                                <div className="text-xs text-muted">{new Date(tx.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="badge category-pill">{categoryName}</span></td>
                                                    <td>
                                                        <div className="flex-center gap-2 justify-start">
                                                            <span className={`status-dot-sm ${isProcessed ? 'green' : 'orange'}`}></span>
                                                            <span className={isProcessed ? 'text-green' : 'text-orange'}>
                                                                {isProcessed ? 'Categorized' : 'Processing'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className={`text-right font-bold ${isIncome ? 'text-green' : 'text-red'}`}>
                                                        {isIncome ? '+' : '-'}${Math.abs(parseFloat(tx.amount || 0)).toFixed(2)}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                        {recentTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                                    No transactions yet. Upload a receipt to get started!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div className="pagination-simple mt-4">
                                    <span>Showing {recentTransactions.length} of {transactions.length} transactions</span>
                                    <motion.button
                                        className="btn btn-secondary sm"
                                        onClick={() => navigate('/transactions')}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        See All
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </AnimatedItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
};

export default Dashboard;
