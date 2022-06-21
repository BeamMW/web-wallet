import React from 'react';
import { styled } from '@linaria/react';
import { ErrorSvg } from '@app/shared/icons';

interface State {
  hasError: boolean;
}

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 150px;
  > svg {
    width: 150px;
    height: 150px;
    margin-bottom: 25px;
  }
`;

export default class ErrorBoundary extends React.Component<any, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorWrapper>
          <ErrorSvg />
          <h1>Something went wrong.</h1>
          <h2>Please, reload extension.</h2>
        </ErrorWrapper>
      );
    }

    const { children } = this.props;

    return children;
  }
}
