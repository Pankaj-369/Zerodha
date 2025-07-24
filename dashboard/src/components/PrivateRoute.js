const loginUrl = process.env.REACT_APP_LOGIN_URL || "http://localhost:3000/login";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children :  (window.location.href = loginUrl); 
};

export default PrivateRoute;



// const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

// // Usage
// axios.get(`${backendUrl}/api/some-endpoint`);
// fetch(`${backendUrl}/api/other-endpoint`);




// import { useEffect, useState } from "react";
// import axios from "axios";

// const PrivateRoute = ({ children }) => {
//   const [isValid, setIsValid] = useState(null);

//  useEffect(() => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     window.location.href = "http://localhost:3000/login";
//     return;
//   }

//   // Slight delay to ensure token is set before verification
//   setTimeout(() => {
//     axios
//       .post("http://localhost:3002/verify-token", { token })
//       .then((res) => {
//         if (res.data.valid) {
//           setIsValid(true);
//         } else {
//           throw new Error("Invalid token");
//         }
//       })
//       .catch((err) => {
//         localStorage.removeItem("token");
//         window.location.href = "http://localhost:3000/login";
//       });
//   }, 100); // 100ms delay helps in cross-host setups
// }, []);


//   if (isValid === null) return <h3>Loading...</h3>;
//   return isValid ? children : null;
// };

// export default PrivateRoute;
