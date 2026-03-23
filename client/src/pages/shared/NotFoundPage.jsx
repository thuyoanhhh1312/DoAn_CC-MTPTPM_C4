import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Result
        status="404"
        title="404"
        subTitle="The requested page could not be found."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
