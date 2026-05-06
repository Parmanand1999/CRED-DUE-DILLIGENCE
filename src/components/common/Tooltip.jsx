import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Tooltip = ({ children, title, side = "top", delay = 200 }) => {
  return (
    <TooltipProvider delayDuration={delay}>
      <ShadTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          {typeof title === "string" ? <p>{title}</p> : title}
        </TooltipContent>
      </ShadTooltip>
    </TooltipProvider>
  );
};
