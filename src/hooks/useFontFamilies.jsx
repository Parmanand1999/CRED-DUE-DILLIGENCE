// // hooks/useFontFamilies.js
// import { useState, useEffect, useRef } from "react";
// import WebFont from "webfontloader";
// import { postData } from "../ApiServices/apiServices";

// let fontListCache = null;
// let fontListPromise = null;

// export const useFontFamilies = () => {
//   const [fontFamilies, setFontFamilies] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const loadedFontsRef = useRef(new Set());

//   useEffect(() => {
//     if (fontListCache) {
//       setFontFamilies(fontListCache);
//       return;
//     }

//     if (fontListPromise) {
//       fontListPromise.then((fonts) => setFontFamilies(fonts));
//       return;
//     }

//     const fetchFonts = async () => {
//       try {
//         setIsLoading(true);
//         const response = await postData("/public/fontList");

//         if (response.status === 200) {
//           const fonts = response.data.data.items.map((f) => f.family);

//           // ✅ Cache the result
//           fontListCache = fonts;
//           setFontFamilies(fonts);
//           return fonts;
//         }
//       } catch (err) {
//         console.error("Error loading fonts:", err);
//         const fallbackFonts = [
//           "Arial",
//           "Helvetica",
//           "Times New Roman",
//           "Georgia",
//           "Roboto",
//           "Open Sans",
//           "Lato",
//           "Montserrat",
//           "Inter",
//           "Poppins",
//         ];

//         fontListCache = fallbackFonts;
//         setFontFamilies(fallbackFonts);
//         return fallbackFonts;
//       } finally {
//         setIsLoading(false);
//         fontListPromise = null;
//       }
//     };

//     fontListPromise = fetchFonts();
//   }, []);

//   const loadFont = (family) => {
//     if (!family || loadedFontsRef.current.has(family)) return;

//     const systemFonts = [
//       "Arial",
//       "Helvetica",
//       "Times New Roman",
//       "Georgia",
//       "Courier New",
//       "Verdana",
//       "Tahoma",
//     ];

//     if (systemFonts.includes(family)) {
//       loadedFontsRef.current.add(family);
//       return;
//     }

//     WebFont.load({
//       google: { families: [family] },
//       active: () => {
//         loadedFontsRef.current.add(family);
//       },
//       inactive: () => {
//         console.warn(`Font failed to load: ${family}`);
//       },
//     });
//   };

//   return {
//     fontFamilies,
//     isLoading,
//     loadFont,
//   };
// };

// export const clearFontCache = () => {
//   fontListCache = null;
//   fontListPromise = null;
// };
