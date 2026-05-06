import React from "react";
import { Spinner } from "@/components/ui/spinner";
const CustomLoader = ({ className, size = 18 }) => {
  return (
    <div
      className={` ${className ? className : "absolute"}   inset-0 flex items-center justify-center  bg-opacity-60 z-10`}
    >
      <div style={{ width: 4 * size, height: 4 * size }}>
        <Spinner className="w-full h-full text-primary " />
      </div>
    </div>
  );
};

export default CustomLoader;
