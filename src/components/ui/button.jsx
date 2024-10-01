import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 transform cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-slate-300',
  {
    variants: {
      variant: {
        blue: 'bg-blue-700 text-white hover:bg-blue-800',
        green: 'bg-green-600 text-white hover:bg-green-700',
        gray: 'bg-gray-500 text-white hover:bg-gray-600',
        outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-100',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      },
      size: {
        md: 'w-full h-9 py-5 text-base text-lg',
        lg: 'h-10 px-12 py-6 text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const [isClicked, setIsClicked] = React.useState(false);
    
    const Comp = asChild ? Slot : 'button';

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isClicked ? 'scale-95' : 'scale-100' // Animation on click
        )}
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
