import { Switch, Route } from "wouter"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import { Toaster } from "@/components/ui/toaster"
import Layout from "@/components/layout"
import Dashboard from "@/pages/dashboard"
import AddExpense from "@/pages/add-expense"
import History from "@/pages/history"
import Settings from "@/pages/settings"
import NotFound from "@/pages/not-found"

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/add">{() => <AddExpense />}</Route>
        <Route path="/history" component={History} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App

