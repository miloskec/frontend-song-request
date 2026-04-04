import { Link } from 'react-router-dom';
import { Card, Screen } from '@/components/ui';

export function NotFoundPage() {
  return (
    <Screen title="Page not found">
      <Card>
        <p style={{ marginTop: 0 }}>This route is not part of the current app shell scope.</p>
        <Link to="/guest" className="dj-link">
          Go back to guest page
        </Link>
      </Card>
    </Screen>
  );
}
