import React from 'react';
import { PageTransition, AnimatedItem } from '../components/common/PageTransition';
import { FaWallet } from 'react-icons/fa';

const Accounts = () => {
    return (
        <PageTransition>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <AnimatedItem>
                    <div className="card" style={{
                        textAlign: 'center',
                        padding: '64px 40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: 'var(--primary)',
                            marginBottom: '8px'
                        }}>
                            <FaWallet />
                        </div>
                        <h1 style={{
                            fontSize: '1.65rem',
                            fontWeight: 800,
                            letterSpacing: '-0.035em'
                        }}>Accounts</h1>
                        <p style={{
                            color: 'var(--text-tertiary)',
                            fontSize: '0.88rem',
                            maxWidth: '320px'
                        }}>Account management is coming soon. Stay tuned for connected bank accounts and wallet tracking.</p>
                    </div>
                </AnimatedItem>
            </div>
        </PageTransition>
    );
};

export default Accounts;
