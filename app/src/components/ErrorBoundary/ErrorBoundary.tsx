import React from 'react';
import * as Sentry from '@sentry/browser';


export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, info: any) {
    this.setState({ hasError: true });
    console.error(error, info)
    Sentry.captureException(error);
  }

  render() {
    return this.props.children;
  }
}
