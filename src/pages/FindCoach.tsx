import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FindCoach = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/marketplace", { replace: true });
  }, [navigate]);

  return null;
};

export default FindCoach;
