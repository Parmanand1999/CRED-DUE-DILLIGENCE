import { Controller, FormProvider, useFormContext } from "react-hook-form";

export const Form = FormProvider;

export const FormField = ({ name, control, render }) => {
  return <Controller name={name} control={control} render={render} />;
};

export const FormItem = ({ children }) => {
  return <div className="space-y-1">{children}</div>;
};

export const FormControl = ({ children }) => {
  return <div>{children}</div>;
};

export const FormMessage = ({ children }) => {
  if (!children) return null;
  return <p className="text-sm text-red-500">{children}</p>;
};