import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaArrowUp, FaArrowDown, FaWallet, FaMagic, FaPlus, FaCloudUploadAlt, FaGasPump, FaHome, FaBolt, FaShoppingBag, FaBoxOpen, FaUniversity, FaFilm, FaGamepad, FaGraduationCap, FaPlane, FaUtensils, FaHospital, FaUser } from 'react-icons/fa';
import { transactionAPI, categoryAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageTransition, StaggerContainer, AnimatedItem } from '../components/common/PageTransition';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setTransactions(txArray);
                setCategories(catData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    return (
        <PageTransition>
            <div className="dashboard-container">
                <StaggerContainer>
                    <AnimatedItem>
                        <header className="flex-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">Dashboard  </h1>
                            </div>
                            <div className="flex-center gap-4">
                                <div className="search-bar-mock">
                                    {/* Search placeholder */}
                                </div>
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
