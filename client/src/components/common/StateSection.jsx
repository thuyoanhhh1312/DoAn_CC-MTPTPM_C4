import { Alert, Empty, Skeleton } from 'antd';

const normalizeError = (error) => {
  if (!error) {
    return null;
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.message || 'Something went wrong. Please try again.';
};

const StateSection = ({
  loading = false,
  error = null,
  empty = false,
  emptyDescription = 'No data available',
  children,
}) => {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 5 }} />;
  }

  const errorMessage = normalizeError(error);

  if (errorMessage) {
    return <Alert type="error" showIcon message="Unable to load data" description={errorMessage} />;
  }

  if (empty) {
    return <Empty description={emptyDescription} />;
  }

  return children;
};

export default StateSection;
