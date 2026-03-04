import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PageTransition, StaggerContainer, AnimatedItem } from '../components/common/PageTransition';

const incomeExpenseData = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Apr', income: 2780, expense: 3908 },
    { name: 'May', income: 1890, expense: 4800 },
    { name: 'Jun', income: 2390, expense: 3800 },
];

const Reports = () => {
    return (
        <PageTransition>
            <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
                <StaggerContainer>
                    <AnimatedItem>
                        <header style={{ marginBottom: '28px' }}>
                            <h1 style={{ 
                                fontSize: '1.65rem', 
                                fontWeight: 800, 
                                letterSpacing: '-0.035em',
                                marginBottom: '6px'
                            }}>Financial Reports</h1>
                            <p style={{ 
                                color: 'var(--text-secondary)', 
                                fontSize: '0.88rem' 
                            }}>Analyze your income and spending trends.</p>
                        </header>
                    </AnimatedItem>

                    <AnimatedItem>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', 
                            gap: '20px' 
                        }}>
                            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ 
                                    marginBottom: '20px', 
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em'
                                }}>Income vs Expense</h3>
                                <div style={{ flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={incomeExpenseData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                            <XAxis dataKey="name" stroke="#aeaeb2" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#aeaeb2" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                contentStyle={{ 
                                                    borderRadius: '14px', 
                                                    border: '1px solid rgba(255,255,255,0.45)', 
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                    backdropFilter: 'blur(20px)',
                                                    background: 'rgba(255,255,255,0.9)',
                                                    fontSize: '0.82rem'
                                                }}
                                            />
                                            <Bar dataKey="income" fill="#34C759" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="expense" fill="#FF3B30" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ 
                                    marginBottom: '20px', 
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em'
                                }}>Net Worth Trend</h3>
                                <div style={{ flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={incomeExpenseData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                            <XAxis dataKey="name" stroke="#aeaeb2" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#aeaeb2" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ 
                                                    borderRadius: '14px', 
                                                    border: '1px solid rgba(255,255,255,0.45)', 
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                    backdropFilter: 'blur(20px)',
                                                    background: 'rgba(255,255,255,0.9)',
                                                    fontSize: '0.82rem'
                                                }}
                                            />
                                            <Line type="monotone" dataKey="income" stroke="#007AFF" strokeWidth={3} dot={{ r: 4, fill: '#007AFF' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </AnimatedItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
};

export default Reports;
