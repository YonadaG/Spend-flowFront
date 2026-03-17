import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ variant = 'default' }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    if (variant === 'icon-only') {
        return (
            <motion.button
                className="theme-toggle-icon"
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
            >
                {isDarkMode ? <FaSun /> : <FaMoon />}
            </motion.button>
        );
    }

    return (
        <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <motion.div
                className="theme-toggle-slider"
                animate={{ x: isDarkMode ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {isDarkMode ? <FaMoon /> : <FaSun />}
            </motion.div>
            <span className="theme-toggle-label">
                {isDarkMode ? 'Dark' : 'Light'}
            </span>
        </motion.button>
    );
};

export default ThemeToggle;
