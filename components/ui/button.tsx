import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow active:scale-[0.98]',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
        outline:
          'border border-outline-variant/80 bg-surface text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-[0.98]',
        secondary:
          'bg-surface-variant text-on-surface hover:bg-surface-variant/80 active:scale-[0.98]',
        ghost:
          'text-on-surface hover:bg-surface-variant/70 hover:text-primary active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        activeNav:
          'bg-primary/10 text-primary font-bold shadow-xs hover:bg-primary/15',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-9 w-9 p-0',
        iconSm: 'h-8 w-8 p-0 rounded-lg',
        iconLg: 'h-11 w-11 p-0 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
