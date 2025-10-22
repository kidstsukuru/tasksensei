import TaskManager from '@/components/TaskManager';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <TaskManager />
    </TooltipProvider>
  );
}

export default App;
