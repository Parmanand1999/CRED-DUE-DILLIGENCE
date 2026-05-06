const FormCard = ({ title, children, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4 border">
      <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-2">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>

      {children}
    </div>
  );
};

export default FormCard;
