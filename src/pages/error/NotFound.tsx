
import { Link } from 'react-router-dom';
import { EmptyState, Button } from '../../components';
import { FiSearch } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <EmptyState
        icon={<FiSearch className="text-primary" />}
        title="404 - Page Not Found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        }
      />
    </div>
  );
};
export default NotFound;
