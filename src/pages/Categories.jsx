import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGasPump, FaUniversity, FaBolt, FaBoxOpen, FaPlus, FaHospital, FaUtensils, FaFilm, FaGamepad, FaGraduationCap, FaPlane, FaPaw, FaEllipsisH } from 'react-icons/fa';
import { categoryAPI, transactionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageTransition, StaggerContainer, AnimatedItem } from '../components/common/PageTransition';
import './Categories.css';

const Categories = () => {
    const { error: showError } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);


    // Category icons mapping
    const categoryIcons = {
        'Fuel': { icon: <FaGasPump />, description: 'Transportation, repairs & gas', colorClass: 'icon-fuel' },
        'Transfer': { icon: <FaUniversity />, description: 'External transfers & savings', colorClass: 'icon-transfer' },
        'Utilities': { icon: <FaBolt />, description: 'Electricity, water, internet', colorClass: 'icon-utilities' },
        'Food': { icon: <FaUtensils />, description: 'Meals, restaurants & groceries', colorClass: 'icon-food' },
        'Hospital': { icon: <FaHospital />, description: 'Medical & healthcare expenses', colorClass: 'icon-hospital' },
        'Entertainment': { icon: <FaFilm />, description: 'Movies, gaming & fun', colorClass: 'icon-entertainment' },
        'Education': { icon: <FaGraduationCap />, description: 'Tuition & learning', colorClass: 'icon-education' },
        'Travel': { icon: <FaPlane />, description: 'Flights & vacations', colorClass: 'icon-travel' },
        'Gaming': { icon: <FaGamepad />, description: 'Video games & hobbies', colorClass: 'icon-gaming' },
        'Pets': { icon: <FaPaw />, description: 'Pet food & care', colorClass: 'icon-pets' },
        'Other': { icon: <FaBoxOpen />, description: 'Uncategorized & personal spending', colorClass: 'icon-other' },
        'Misc': { icon: <FaEllipsisH />, description: 'Miscellaneous expenses', colorClass: 'icon-other' }
    };

    // Default budget limits when no saved value exists
    const mockBudgets = {
        'Fuel': 200,
        'Transfer': 1000,
        'Utilities': 300,
        'Food': 500,
        'Hospital': 400,
        'Other': 500
    };

    const getBudgetLimit = (category) => {
        const savedLimit = localStorage.getItem(`budget_limit_${category.id}`);
        if (savedLimit !== null) {
            const parsedLimit = parseFloat(savedLimit);
            if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
                return parsedLimit;
            }
        }

        return mockBudgets[category.name] || 500;
    };

    const fetchCategories = useCallback(async () => {
        try {
            const [catsData, txsData] = await Promise.all([
                categoryAPI.getAll(),
                transactionAPI.getAll()
            ]);

            // Handle pagination structure (response.data.transactions)
            const transactionsList = Array.isArray(txsData) ? txsData : (txsData.transactions || []);

            // Calculate spent amount per category
            const processedCategories = catsData.map(cat => {
                const catTransactions = transactionsList.filter(tx => {
                    return (tx.category && tx.category.id === cat.id) || tx.category_id === cat.id;
                });
                const totalSpent = catTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

                // Priority: cat.icon from backend -> mapping via cat.name -> default
                const iconName = cat.icon || cat.name;
                const iconInfo = categoryIcons[iconName] || categoryIcons[cat.name] || {
                    icon: <FaBoxOpen />,
                    description: 'General expenses',
                    colorClass: 'icon-default'
                };

                const limit = getBudgetLimit(cat);

                return {
                    ...cat,
                    spent: totalSpent,
                    limit: limit,
                    icon: iconInfo.icon,
                    description: iconInfo.description,
                    colorClass: iconInfo.colorClass,
                    percent: Math.min((totalSpent / limit) * 100, 100)
                };
            });

            setCategories(processedCategories);
        } catch (err) {
            console.error("Error fetching category data:", err);
            showError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);



    const getStatusColor = (percent) => {
        if (percent < 50) return '#00d09c'; // Green
        if (percent < 80) return '#ffb020'; // Orange/Yellow
        return '#ff6b6b'; // Red
    };

    const getStatusText = (percent) => {
        if (percent < 50) return { text: 'Healthy', class: 'status-healthy' };
        if (percent < 80) return { text: 'Near Limit', class: 'status-warning' };
        return { text: 'Over Budget', class: 'status-critical' };
    };

    if (loading) {
        return (
            <div className="categories-container">
                <LoadingSpinner variant="skeleton" />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="categories-container">
                <StaggerContainer>
                    <AnimatedItem>
                        <div className="categories-header">
                            <h1>Category & Budget Management</h1>
                            <p>Effortlessly organize your finances. Synchronize accounts and track your spending breakdown.</p>
                        </div>
                    </AnimatedItem>

                    <AnimatedItem>
                        <div className="categories-controls">
                            <div className="date-selector">
                                <span>📅 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/categories/new" className="add-category-btn">
                                    <FaPlus /> Add New Category
                                </Link>
                            </motion.div>
                        </div>
                    </AnimatedItem>

                    <AnimatedItem>
                        <div className="categories-grid">
                            {categories.map((cat, index) => {
                                const status = getStatusText(cat.percent);
                                const progressColor = getStatusColor(cat.percent);

                                return (
                                    <motion.div
                                        key={cat.id}
                                        className={`category-card card-${cat.name.toLowerCase()}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.06, duration: 0.35 }}
                                        whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.08)' }}
                                    >
                                        <Link to={`/categories/${cat.id}`} className="card-link">
                                            <div className="card-header">
                                                <div className={`category-icon ${cat.colorClass}`}>
                                                    {cat.icon}
                                                </div>
                                                <div className={`status-badge ${status.class}`}>
                                                    {status.text}
                                                </div>
                                            </div>

                                            <div className="category-info">
                                                <h3>{cat.name}</h3>
                                                <p>{cat.description}</p>
                                            </div>

                                            <div className="budget-info">
                                                <div className="budget-numbers">
                                                    <span className="spent">${cat.spent.toFixed(2)} spent</span>
                                                    <span className="limit">${cat.limit} limit</span>
                                                </div>
                                                <div className="progress-bar-bg">
                                                    <motion.div
                                                        className="progress-bar-fill"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${cat.percent}%` }}
                                                        transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                                        style={{ backgroundColor: progressColor }}
                                                    />
                                                </div>
                                            </div>
                                        </Link>

                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatedItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
};

export default Categories;
