import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong</h2>
          <p>We hit an unexpected error. Please try again.</p>
          <button
            onClick={this.handleReload}
            style={{ padding: '8px 16px', marginTop: 12 }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
