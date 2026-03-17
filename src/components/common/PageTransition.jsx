/* eslint-disable react-refresh/only-export-components */
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 12,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const slideInRight = {
    initial: { opacity: 0, x: 20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

/**
 * Wrap a page component to add entrance animation
 */
const PageTransition = ({ children, className = '' }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Wrap a container to stagger-animate its children.
 * Each direct child should use AnimatedItem.
 */
const StaggerContainer = ({ children, className = '', ...props }) => {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

/**
 * Used inside a StaggerContainer for each item
 */
const AnimatedItem = ({ children, className = '', variant = 'fadeInUp', ...props }) => {
    const variants = {
        fadeInUp,
        scaleIn,
        slideInRight,
    };

    return (
        <motion.div
            variants={variants[variant] || fadeInUp}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export { PageTransition, StaggerContainer, AnimatedItem, pageVariants, fadeInUp, scaleIn, slideInRight };
export default PageTransition;
