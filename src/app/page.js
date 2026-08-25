import Chess from "@/component/board";
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <Link href="chess">
        <button>Go to Chess</button>
      </Link>
      <Link href="xiangqi">
        <button>Go to Xiangqi</button>
      </Link>
    </div>
  );
}
