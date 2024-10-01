import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 transform cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-slate-300',
  {
    variants: {
      variant: {
        blue: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700 transition',
        green: 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-400 hover:to-green-600 transition',
        gray: 'bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:from-gray-400 hover:to-gray-600 transition',
        close: 'text-gray-400 hover:text-white transition',
        hamburger: 'text-white hover:text-gray-400 transition',
      },
      size: {
        md: 'w-full py-2 text-base text-lg',
        lg: 'px-12 py-3 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const [isClicked, setIsClicked] = React.useState(false);

    const Comp = asChild ? Slot : 'button';

    const handleInteractionStart = () => {
      setIsClicked(true);
    };

    const handleInteractionEnd = () => {
      setIsClicked(false);
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isClicked ? 'scale-95' : 'scale-100' // Animation on click or touch
        )}
        ref={ref}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onTouchStart={handleInteractionStart} // For touch devices
        onTouchEnd={handleInteractionEnd}     // For touch devices
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
