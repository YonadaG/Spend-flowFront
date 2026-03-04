import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', variant = 'default' }) => {
  if (variant === 'fullpage') {
    return (
      <div className="loading-fullpage">
        <div className="loading-fullpage-inner">
          <div className="loading-logo-ring">
            <motion.div
              className="loading-ring-segment ring-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="loading-ring-segment ring-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="loading-ring-segment ring-3"
              animate={{ rotate: 360 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
            />
            <div className="loading-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                />
              </svg>
            </div>
          </div>
          <motion.div
            className="loading-brand-text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            SpendFlow
          </motion.div>
          <div className="loading-dots-row">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="loading-dot"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          {text && (
            <motion.p
              className="loading-status-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {text}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className="skeleton-container">
        <div className="skeleton-header">
          <div className="skeleton-line skeleton-lg shimmer" />
          <div className="skeleton-line skeleton-sm shimmer" />
        </div>
        <div className="skeleton-cards">
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton-card shimmer" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="skeleton-card-icon shimmer" />
              <div className="skeleton-card-lines">
                <div className="skeleton-line skeleton-md shimmer" />
                <div className="skeleton-line skeleton-xl shimmer" />
                <div className="skeleton-line skeleton-sm shimmer" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton-table">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-row shimmer" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="skeleton-cell-icon shimmer" />
              <div className="skeleton-cell-text">
                <div className="skeleton-line skeleton-md shimmer" />
                <div className="skeleton-line skeleton-sm shimmer" />
              </div>
              <div className="skeleton-line skeleton-xs shimmer" />
              <div className="skeleton-line skeleton-xs shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default spinner with improved animations
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="spinner-modern">
        <motion.div
          className="spinner-arc"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {text && (
        <motion.span
          className="spinner-text-modern"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
};

export default LoadingSpinner;
