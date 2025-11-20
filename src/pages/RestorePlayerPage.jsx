import { useParams } from 'react-router-dom';
import RestorePlayerPanel from '../features/players/RestorePlayerPanel';

/**
 * Pagina per ripristinare profili player corrotti
 */
export default function RestorePlayerPage() {
  const { clubId } = useParams();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <RestorePlayerPanel clubId={clubId || 'sporting-cat'} />
    </div>
  );
}
