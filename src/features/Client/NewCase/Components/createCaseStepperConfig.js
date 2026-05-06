export const OTHER_CATEGORY_ID = "69d54ac84ae8adccc8d4073e";
export const GENERAL_DETAILS_CATEGORY_ID = "69d54ac84ae8adccc8d40738";
export const GENERAL_DETAILS_SUBCATEGORY_ID = "69d54ac84ae8adccc8d4073b";

export const CREATE_CASE_STEPS = [
  { 
    id: "service", 
    label: "Select Service", 
    validationType: "service",
    roles:["Admin", "Client", "Backend Team"],
  },
  {
    id: "dynamicMain",
    label: "Case-Registration Details",
    validationType: "dynamicMain",
    roles: ["Admin", "Client", "Backend Team"],
  },
  {
    id: "dynamicOther",
    label: "Other Details",
    validationType: "dynamicOther",
    roles: ["Admin","Backend Team"]
  },
];


export const getVisibleSteps = (userRole) => {
  console.log(userRole,"userRole");
  
  if (!userRole) return CREATE_CASE_STEPS;

  return CREATE_CASE_STEPS.filter((step) => {
    if (!step.roles || !Array.isArray(step.roles)) {
      return true;
    }
    return step.roles.includes(userRole);
  });
};
