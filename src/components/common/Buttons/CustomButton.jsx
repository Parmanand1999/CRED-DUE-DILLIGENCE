import React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const CustomButton = ({
  loading = false,
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
  spinnerPosition = "left", // left | right
  ...props
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={` ${className}  flex items-center justify-center gap-2 cursor-pointer`}
      {...props}
    >
      {/* LEFT SPINNER */}
      {loading && spinnerPosition === "left" && (
        <Spinner className="h-auto  w-auto" />
      )}

      {children}

      {/* RIGHT SPINNER */}
      {loading && spinnerPosition === "right" && (
        <Spinner className="h-auto  w-auto" />
      )}
    </Button>
  );
};

export default CustomButton;
