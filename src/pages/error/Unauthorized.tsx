
import { Link } from 'react-router-dom';
import { EmptyState, Button } from '../../components';
import { FiShieldOff } from 'react-icons/fi';

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <EmptyState
        icon={<FiShieldOff className="text-danger" />}
        title="403 - Unauthorized"
        description="You don't have permission to access this page."
        action={
          <Link to="/">
            <Button>Return to Safe Area</Button>
          </Link>
        }
      />
    </div>
  );
};
export default Unauthorized;
