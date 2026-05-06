// import { useEffect, useState, useRef } from "react";

// export const useNetworkStatus = () => {
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//     // const [isOnline, setIsOnline] = useState(false);
//   const wasOffline = useRef(false);

//   useEffect(() => {
//     const handleOnline = () => {
//       setIsOnline(true);

//       // Reload only if previously offline
//       if (wasOffline.current) {
//         window.location.reload();
//       }
//     };

//     const handleOffline = () => {
//       setIsOnline(false);
//       wasOffline.current = true;
//     };

//     window.addEventListener("online", handleOnline);
//     window.addEventListener("offline", handleOffline);

//     return () => {
//       window.removeEventListener("online", handleOnline);
//       window.removeEventListener("offline", handleOffline);
//     };
//   }, []);

//   return isOnline;
// };
