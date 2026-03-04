import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaGasPump, FaBriefcase, FaCloud, FaCoffee, FaHome, FaDownload, FaTrash, FaBoxOpen } from 'react-icons/fa';
import { transactionAPI, categoryAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageTransition, StaggerContainer, AnimatedItem } from '../components/common/PageTransition';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Map category names to icons
    const getCategoryIcon = (categoryName) => {
        const iconMap = {
            'Fuel': <FaGasPump />,
            'Transfer': <FaBriefcase />,
            'Utilities': <FaCloud />,
            'Groceries': <FaCoffee />,
            'Housing': <FaHome />,
        };
        return iconMap[categoryName] || <FaBoxOpen />;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [txData, catData] = await Promise.all([
                    transactionAPI.getAll(),
                    categoryAPI.getAll()
                ]);
                setTransactions(txData.transactions || []);
                setCategories(catData);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await transactionAPI.delete(id);
                setTransactions(transactions.filter(t => t.id !== id));
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const getCategoryName = (tx) => {
        // Updated to use nested category object if available
        if (tx.category) return tx.category.name;
        // Fallback for older logic
        const cat = categories.find(c => c.id === tx.category_id);
        return cat ? cat.name : 'Uncategorized';
    };

    const getStatusBadge = (status, category) => {
        if (status === 'processed' || !!category) return { text: 'Verified', class: 'green' };
        if (status === 'pending') return { text: 'Processing', class: 'yellow' };
        if (status === 'failed') return { text: 'Failed', class: 'red' };
        return { text: 'Processing', class: 'gray' };
    };

    const formatTransactionDate = (value) => {
        if (!value) return 'N/A';
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) return 'N/A';
        return parsedDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    const filteredTransactions = transactions.filter(tx =>
        (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.merchant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.payment_reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.invoice_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(tx).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate totals
    const totalExpenses = transactions
        .filter(tx => tx.transaction_type === 'expense' || !tx.transaction_type)
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const totalIncome = transactions
        .filter(tx => tx.transaction_type === 'income')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const handleExportCSV = () => {
        if (transactions.length === 0) {
            alert("No transactions to export");
            return;
        }

        // CSV Headers
        const headers = ["Date", "Description", "Vendor", "Category", "Amount", "Type", "Status"];

        // CSV data mapping
        const csvRows = transactions.map(tx => {
            const date = formatTransactionDate(tx.created_at);
            const description = tx.description || "";
            const vendor = tx.merchant_name || tx.vendor || "";
            const category = getCategoryName(tx);
            const amount = Math.abs(parseFloat(tx.amount || 0)).toFixed(2);
            const type = tx.transaction_type || "expense";
            const status = tx.status || "processed";

            // Sanitize values for CSV (escape quotes, wrap in quotes)
            return [date, description, vendor, category, amount, type, status]
                .map(val => `"${String(val).replace(/"/g, '""')}"`)
                .join(",");
        });

        // Combine headers and rows
        const csvContent = [headers.join(","), ...csvRows].join("\n");

        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="transactions-container-light">
                <LoadingSpinner variant="skeleton" />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="transactions-container-light">
                <StaggerContainer>
                    <AnimatedItem>
                        <header className="transactions-header mb-8">
                            <div className="transactions-heading">
                                <h1 className="transactions-title">Transaction History</h1>
                                <p className="text-muted transactions-subtitle">You have {transactions.length} transactions.</p>
                            </div>
                            <div className="transactions-actions flex-center gap-3">
                                <motion.button
                                    className="btn btn-secondary flex-center gap-2"
                                    onClick={() => navigate('/transactions/new')}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FaPlus /> Add Manual
                                </motion.button>
                                <motion.button
                                    className="btn btn-secondary flex-center gap-2"
                                    onClick={() => navigate('/upload')}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FaDownload /> Upload Receipt
                                </motion.button>
                                <motion.button
                                    className="btn btn-primary flex-center gap-2"
                                    onClick={handleExportCSV}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FaDownload /> Export CSV
                                </motion.button>
                            </div>
                        </header>
                    </AnimatedItem>

                    {/* Filter Bar */}
                    <AnimatedItem>
                        <div className="card mb-6 p-4">
                            <div className="flex-between gap-4">
                                <div className="search-wrapper-light flex-1">
                                    <FaSearch className="search-icon-light" />
                                    <input
                                        type="text"
                                        placeholder="Search by description, merchant, or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex-center gap-3">
                                    <button className="btn btn-ghost text-red sm" onClick={() => setSearchTerm('')}>Clear All</button>
                                </div>
                            </div>
                        </div>
                    </AnimatedItem>

                    {/* Transactions Table */}
                    <AnimatedItem>
                        <div className="card p-0 overflow-hidden">
                            <div className="transactions-table-wrap">
                                <table className="table-clean full-width transactions-table">
                                    <thead>
                                        <tr className="bg-checkered">
                                            <th className="pl-6 col-date">DATE</th>
                                            <th className="col-description">DESCRIPTION</th>
                                            <th className="col-category">CATEGORY</th>
                                            <th className="col-status">STATUS</th>
                                            <th className="col-amount text-right pr-6">AMOUNT</th>
                                            <th className="col-action text-right pr-6">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((tx, index) => {
                                            const categoryName = getCategoryName(tx);
                                            const statusInfo = getStatusBadge(tx.status, tx.category);
                                            const isIncome = tx.transaction_type === 'income';

                                            return (
                                                <motion.tr
                                                    key={tx.id}
                                                    className="hover-row tx-row"
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(index * 0.03, 0.6), duration: 0.25 }}
                                                >
                                                    <td className="pl-6 text-muted tx-date">
                                                        {formatTransactionDate(tx.created_at)}
                                                    </td>
                                                    <td className="tx-col-description">
                                                        <div className="tx-main-cell">
                                                            <div className={`icon-box-sm ${isIncome ? 'green' : 'orange'}`}>
                                                                {getCategoryIcon(categoryName)}
                                                            </div>
                                                            <div className="tx-copy">
                                                                <span className="tx-title">{tx.merchant_name || tx.vendor || tx.description || 'Transaction'}</span>
                                                                {tx.payment_reason && (
                                                                    <p className="tx-meta">{tx.payment_reason}</p>
                                                                )}
                                                                {tx.invoice_no && (
                                                                    <p className="tx-meta">Invoice: {tx.invoice_no}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-pill ${categoryName.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                                                            {categoryName}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex-center justify-start gap-2 tx-status-cell">
                                                            <span className={`status-dot-sm ${statusInfo.class}`}></span>
                                                            <span className="tx-status-text">{statusInfo.text}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`text-right pr-6 tx-amount ${isIncome ? 'text-green' : 'text-red'}`}>
                                                        {isIncome ? '+' : '-'}${Math.abs(parseFloat(tx.amount || 0)).toFixed(2)}
                                                    </td>
                                                    <td className="text-right pr-6">
                                                        <motion.button
                                                            className="btn-icon-ghost"
                                                            onClick={() => handleDelete(tx.id)}
                                                            aria-label="Delete transaction"
                                                            title="Delete transaction"
                                                            whileHover={{ scale: 1.15 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                        {filteredTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                                    No transactions found. Upload a receipt to get started!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination p-4 border-t">
                                <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
                            </div>
                        </div>
                    </AnimatedItem>

                    {/* Bottom Summary Cards */}
                    <AnimatedItem>
                        <div className="grid-3 mt-8">
                            <motion.div
                                className="card flex-between"
                                whileHover={{ y: -3, boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <div>
                                    <p className="text-muted text-xs uppercase font-bold">Total Expenses</p>
                                    <h2 className="mt-2 text-dark">-${totalExpenses.toFixed(2)}</h2>
                                </div>
                            </motion.div>
                            <motion.div
                                className="card flex-between"
                                whileHover={{ y: -3, boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <div>
                                    <p className="text-muted text-xs uppercase font-bold">Total Income</p>
                                    <h2 className="mt-2 text-dark">+${totalIncome.toFixed(2)}</h2>
                                </div>
                            </motion.div>
                            <motion.div
                                className="card bg-green-light flex-between relative overflow-hidden"
                                whileHover={{ y: -3, boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <div className="relative z-10">
                                    <p className="text-green-dark text-xs uppercase font-bold">AI Categorization</p>
                                    <h2 className="mt-2 text-dark">{transactions.filter(t => t.status === 'processed').length} Processed</h2>
                                </div>
                                <div className="bg-shape"></div>
                            </motion.div>
                        </div>
                    </AnimatedItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
};

export default Transactions;
