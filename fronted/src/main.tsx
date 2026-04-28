import { Component, type ErrorInfo, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

interface RootErrorBoundaryState {
    errorMessage: string | null;
}

class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorBoundaryState> {
    state: RootErrorBoundaryState = {
        errorMessage: null,
    };

    static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
        if (error instanceof Error) {
            return { errorMessage: error.message };
        }

        return { errorMessage: '应用启动失败，请刷新后重试。' };
    }

    componentDidCatch(error: unknown, info: ErrorInfo) {
        // Keep console output for fast diagnosis when users report a blank page.
        console.error('Root render error:', error, info.componentStack);
    }

    render() {
        if (!this.state.errorMessage) {
            return this.props.children;
        }

        return (
            <div
                style={{
                    padding: '24px',
                    margin: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(220, 40, 40, 0.35)',
                    background: 'rgba(255, 245, 245, 0.95)',
                    color: '#7f1d1d',
                    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
                    lineHeight: 1.6,
                }}
            >
                <h2 style={{ marginTop: 0 }}>页面渲染失败</h2>
                <p style={{ marginBottom: 0 }}>{this.state.errorMessage}</p>
            </div>
        );
    }
}

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RootErrorBoundary>
        <App />
    </RootErrorBoundary>,
);
