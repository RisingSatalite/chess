import Chess from "@/component/board";
import Link from 'next/link'

export default function Home() {
  return (
    <div className="xiangqi-shell chess-shell" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '2rem' }}>
      <Link href="chess">
        <button>Go to Chess</button>
      </Link>
      <Link href="xiangqi">
        <button>Go to Xiangqi</button>
      </Link>
      <Link href="shogi">
        <button>Go to Shogi</button>
      </Link>
    </div>
  );
}
