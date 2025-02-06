import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema } from "@shared/schema";
import { type Category } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

export default function AddExpense() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm({
    resolver: zodResolver(
      insertExpenseSchema.extend({
        amount: insertExpenseSchema.shape.amount.transform((val) => {
          if (typeof val === "string") {
            const parsed = parseFloat(val);
            if (isNaN(parsed)) throw new Error("Monto inválido");
            return Math.round(parsed * 100);
          }
          return Math.round(val * 100);
        }),
      })
    ),
    defaultValues: {
      description: "",
      amount: "",
      categoryId: undefined,
      date: new Date(),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      return apiRequest("POST", "/api/expenses", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "¡Éxito!",
        description: "Gasto agregado correctamente",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el gasto. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agregar Gasto</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Descripción</FormLabel>
                <FormControl>
                  <Input {...field} className="text-lg p-6" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Monto ($)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="text-lg p-6"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || parseFloat(value) > 0) {
                        field.onChange(value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Categoría</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="text-lg p-6">
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                        className="text-lg"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Fecha</FormLabel>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full text-lg p-6 h-auto"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(field.value, "PPP", { locale: es })}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full text-xl p-6 h-auto"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Agregando..." : "Agregar Gasto"}
          </Button>
        </form>
      </Form>
    </div>
  );
}