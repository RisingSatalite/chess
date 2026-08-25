import Chess from "@/component/board";
import Link from 'next/link'

export default function Home() {
  return (
    <div className="xiangqi-shell chess-shell">
      <Link href="chess">
        <button>Go to Chess</button>
      </Link>
      <Link href="xiangqi">
        <button>Go to Xiangqi</button>
      </Link>
    </div>
  );
}
