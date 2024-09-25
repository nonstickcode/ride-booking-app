'use client';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TimePicker = ({ time, setTime }) => {
  return (
    <div className="mb-6 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start border border-gray-500 bg-gray-800 text-left font-normal text-white',
              !time && 'text-gray-500'
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time ? time : <span>Pick a Time</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 rounded-md bg-white p-2 shadow-lg">
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex w-full justify-between rounded-md border bg-white p-2 text-2xl text-black"
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimePicker;
