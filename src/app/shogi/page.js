import ShogiBoard from '@/component/shogi';

export default function ShogiPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#e5e7eb' }}>
      <ShogiBoard />
    </main>
  );
}
