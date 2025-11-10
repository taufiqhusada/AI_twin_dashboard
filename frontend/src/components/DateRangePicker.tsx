import { Button } from './ui/button';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useEffect, useState } from 'react';

interface DateRangePickerProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [selectedValue, setSelectedValue] = useState('30d');

  // Calculate which preset value matches the current date range
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dateRange.start === dateRange.end && dateRange.end === today) {
      setSelectedValue('today');
    } else if (diffDays === 7) {
      setSelectedValue('7d');
    } else if (diffDays === 30) {
      setSelectedValue('30d');
    } else if (diffDays === 90) {
      setSelectedValue('90d');
    }
  }, [dateRange]);

  const handleRangeChange = (value: string) => {
    setSelectedValue(value);
    const endDate = new Date(); // Use current date instead of hardcoded
    const startDate = new Date(endDate);

    switch (value) {
      case 'today':
        // Start and end are the same day (today)
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    onDateRangeChange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <Select value={selectedValue} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
