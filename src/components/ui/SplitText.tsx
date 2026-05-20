import { useEffect, useRef, ReactNode } from 'react';
import SplitType from 'split-type';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SplitTextProps {
  children: ReactNode;
  className?: string;
  type?: 'chars' | 'words' | 'lines';
  onSplit?: (split: SplitType) => void;
}

export default function SplitText({ children, className, type = 'chars', onSplit }: SplitTextProps) {
  const textRef = useRef<HTMLDivElement>(null);

  const onSplitRef = useRef(onSplit);
  
  useEffect(() => {
    onSplitRef.current = onSplit;
  }, [onSplit]);

  useEffect(() => {
    if (!textRef.current) return;

    const split = new SplitType(textRef.current, { types: type });
    
    if (onSplitRef.current) onSplitRef.current(split);

    return () => {
      split.revert();
    };
  }, [children, type]);

  return (
    <div ref={textRef} className={cn('relative', className)}>
      {children}
    </div>
  );
}
