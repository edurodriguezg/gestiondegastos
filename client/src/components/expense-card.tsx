import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { type Expense, type Category } from "@shared/schema";

export function ExpenseCard({ expense, category }: { expense: Expense; category: Category }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{expense.description}</h3>
            <p className="text-sm text-muted-foreground">{category.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">${(expense.amount / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(expense.date), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}