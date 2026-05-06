// import { useCallback, useEffect, useRef, useState } from "react";

// import { toast } from "react-toastify";
// import { getData } from "../ApiServices/apiServices";
// import { useNetworkStatus } from "./useNetworkStatus";

// const usePollingWorker = ({
//   storageKey,        // 🔥 unique per export type
//   onCompleted,
//   onFailed,
//   interval = 5000,
// }) => {
//   const workerRef = useRef(null);
//   const pollUrlRef = useRef(null);
//   const isCompletedRef = useRef(false);
//   const isOnline = useNetworkStatus();

//   const [loader, setLoader] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);

//   const stopPolling = useCallback(() => {
//     if (workerRef.current) {
//       workerRef.current.terminate();
//       workerRef.current = null;
//     }
//     setLoader(false);
//     setIsRunning(false);
//     localStorage.removeItem("isGenerating");
//     pollUrlRef.current = null;
//     isCompletedRef.current = false;
//   }, []);

//   const startPolling = useCallback(
//     ({ pollUrl }) => {
//       if (!pollUrl) return;

//       if (workerRef.current) stopPolling();

//       pollUrlRef.current = pollUrl;

//       workerRef.current = new Worker(
//         new URL("../Workers/exportPolling.worker.jsx", import.meta.url)
//       );

//       setLoader(true);
//       setIsRunning(true);

//       workerRef.current.postMessage({ interval });

//       workerRef.current.onmessage = async (e) => {
//         if (e.data.type !== "TICK") return;
//         if (isCompletedRef.current) return;
//         // ✅ STEP 5 — STOP API CALL IF OFFLINE
//         if (!navigator.onLine) {
//           console.warn("Offline — skipping poll");
//           return;
//         }
//         try {
//           localStorage.setItem("isGenerating", "true");
//           const res = await getData(pollUrlRef.current);
//           const data = res?.data?.data?.responseData;
//           if (!data) return;

//           const { status, progress, success } = data;

//           if (
//             status?.toLowerCase() === "completed" &&
//             success === true &&
//             Number(progress) === 100
//           ) {
//             isCompletedRef.current = true;
//             onCompleted?.(data);
//             localStorage.removeItem(storageKey);
//             localStorage.removeItem("isGenerating");
//             stopPolling();
//           }

//           if (status === "failed" && success === false) {
//             toast.error("Export failed");
//             onFailed?.(data);
//             localStorage.removeItem(storageKey);
//             localStorage.removeItem("isGenerating");
//             stopPolling();
//           }
//         } catch (err) {
//           if (!navigator.onLine) {
//             console.warn("Offline — polling paused");
//             return;
//           }
//           console.error("Polling error", err);
//         }
//       };
//     },
//     [interval, onCompleted, onFailed, stopPolling, storageKey]
//   );

//   // 🔁 Resume after reload
//   useEffect(() => {
//     const stored = localStorage.getItem(storageKey);
//     if (!stored) return;

//     const { pollUrl } = JSON.parse(stored);
//     if (pollUrl) {
//       startPolling({ pollUrl });
//     }
//   }, [startPolling, storageKey]);

//   useEffect(() => {
//     if (isOnline && isRunning && pollUrlRef.current) {
//       console.log("Reconnected — syncing immediately");

//       getData(pollUrlRef.current)
//         .then((res) => {
//           const data = res?.data?.data?.responseData;
//           if (!data) return;

//           const { status, progress, success } = data;

//           if (
//             status?.toLowerCase() === "completed" &&
//             success === true &&
//             Number(progress) === 100
//           ) {
//             isCompletedRef.current = true;
//             onCompleted?.(data);
//             localStorage.removeItem(storageKey);
//             stopPolling();
//           }
//         })
//         .catch(() => { });
//     }
//   }, [isOnline]);

//   return {
//     startPolling,
//     stopPolling,
//     loader,
//     isRunning,
//   };
// };

// export default usePollingWorker;
