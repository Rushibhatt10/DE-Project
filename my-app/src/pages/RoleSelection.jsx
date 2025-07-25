import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Select your role</h1>
      <button
        onClick={() => handleRoleSelect("user")}
        className="px-6 py-3 bg-blue-500 text-white rounded-xl"
      >
        I'm a User
      </button>
      <button
        onClick={() => handleRoleSelect("provider")}
        className="px-6 py-3 bg-green-500 text-white rounded-xl"
      >
        I'm a Provider
      </button>
    </div>
  );
};

export default RoleSelection;