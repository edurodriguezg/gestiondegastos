import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseCard } from "@/components/expense-card";
import { type Expense, type Category } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PiggyBankIcon, TrendingUpIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (loadingExpenses || loadingCategories || !expenses || !categories) {
    return <DashboardSkeleton />;
  }

  const currentMonth = new Date();
  const monthlyExpenses = expenses.filter(
    (expense) =>
      format(new Date(expense.date), "MM-yyyy") ===
      format(currentMonth, "MM-yyyy")
  );

  const totalAmount = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Control de Gastos</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Total Mensual</CardTitle>
          <PiggyBankIcon className="h-8 w-8 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">${(totalAmount / 100).toFixed(2)}</div>
          <p className="text-muted-foreground">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Por Categoría</CardTitle>
          <TrendingUpIcon className="h-8 w-8 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex justify-between items-center">
                <span className="text-lg">{category.name}</span>
                <span className="text-lg font-medium">
                  ${((expensesByCategory[category.id] || 0) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mt-8 mb-4">Gastos Recientes</h2>
      {monthlyExpenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            category={categories.find((c) => c.id === expense.categoryId)!}
          />
        ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-48" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}