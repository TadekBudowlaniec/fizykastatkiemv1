import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'gradient' | 'outline' | 'ghost' | 'light' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer select-none whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none';

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-[0.95rem] px-6 py-3',
  lg: 'text-base px-8 py-4',
};

const variants: Record<Variant, string> = {
  gradient:
    'text-white shadow-[0_10px_30px_-8px_rgba(107,77,246,0.6)] hover:shadow-[0_16px_40px_-8px_rgba(244,63,143,0.6)] hover:-translate-y-0.5 [background:linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] bg-[length:200%_200%] hover:bg-[position:100%_0]',
  outline:
    'border-2 border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white hover:-translate-y-0.5',
  ghost: 'text-slate hover:text-brand-600 hover:bg-brand-50',
  light:
    'bg-white text-brand-700 shadow-soft hover:-translate-y-0.5 hover:shadow-card',
  dark: 'bg-navy-900 text-white hover:bg-navy-800 hover:-translate-y-0.5',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ComponentPropsWithoutRef<'button'> & { href?: undefined };
type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<'a'>,
    'href'
  >;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'gradient', size = 'md', className, children } = props;
  const classes = cn(base, sizes[size], variants[variant], className);

  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props as ButtonAsLink;
    const isExternal = /^https?:\/\//.test(href) || href.startsWith('mailto:');
    if (isExternal) {
      return (
        <a href={href} className={classes} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
