import CSSPhone from './CSSPhone';

export default function Hero({ active = false }: { active?: boolean }) {
  return <CSSPhone active={active} />;
}
