import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExpenseCard } from "@/components/expense-card";
import { type Expense, type Category } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths, startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: [
      "/api/expenses",
      {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
      },
    ],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (loadingExpenses || loadingCategories) {
    return <HistorySkeleton />;
  }

  const months = Array.from({ length: 12 }, (_, i) =>
    subMonths(startOfMonth(new Date()), i)
  );

  const monthlyTotal = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Expense History</h1>

      <div className="space-y-4">
        <Select
          value={format(selectedDate, "yyyy-MM")}
          onValueChange={(value) => setSelectedDate(new Date(value))}
        >
          <SelectTrigger className="text-lg p-6">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((date) => (
              <SelectItem
                key={format(date, "yyyy-MM")}
                value={format(date, "yyyy-MM")}
                className="text-lg"
              >
                {format(date, "MMMM yyyy")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-2xl font-bold">
          Total: ${(monthlyTotal / 100).toFixed(2)}
        </div>

        <div className="space-y-4">
          {expenses
            ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                category={categories?.find((c) => c.id === expense.categoryId)!}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-8 w-32" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
