import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Result
        status="403"
        title="403"
        subTitle="You are authenticated but do not have permission to access this page."
        extra={[
          <Button key="home" onClick={() => navigate('/')}>
            Back to customer portal
          </Button>,
          <Button key="admin" type="primary" onClick={() => navigate('/admin')}>
            Try admin home
          </Button>,
        ]}
      />
    </div>
  );
};

export default ForbiddenPage;
