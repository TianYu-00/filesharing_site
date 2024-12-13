import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

function useErrorChecker() {
  const { setUserInfo } = useUser();
  const navigate = useNavigate();

  const checkError = (error) => {
    // console.log(error?.response?.data?.code);
    if (error?.response?.data?.code === "NOT_LOGGED_IN") {
      setUserInfo(null);
      navigate("/auth");
      toast.error(error?.response?.data?.msg || "Error in error checker");
    } else {
      toast.error(error?.response?.data?.msg || "Error in error checker");
    }
  };

  return checkError;
}

export default useErrorChecker;
