interface ToolBtnProps {
  children: React.ReactNode;
  label: string;
}

const ToolBtn = ({ children, label }: ToolBtnProps) => {
  return (
    <button className="hover:text-gray-300">
      {children}
      {label}
    </button>
  );
};

export default ToolBtn;
