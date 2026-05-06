import { ToastContainer } from "react-toastify";
import "./App.css";
import AppRouter from "./Routes/AppRouter";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  return (
    <>
      <TooltipProvider>
        <AppRouter />
        <ToastContainer position="top-right" autoClose={3000} />
      </TooltipProvider>
    </>
  );
}

export default App;
