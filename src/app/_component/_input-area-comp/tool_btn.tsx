interface ToolBtnProps {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ToolBtn = ({ children, label, onClick }: ToolBtnProps) => {
  return (
    <button
      className="hover:text-blue-400 transition-colors flex items-center"
      onClick={onClick}
    >
      <span className="mr-1">{children}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
};

export default ToolBtn;
