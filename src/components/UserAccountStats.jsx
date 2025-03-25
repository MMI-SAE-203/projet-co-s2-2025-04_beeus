// import { useState, useEffect } from "react";
// import userBaseImg from "../icons/user.svg";
// import locationIcon from "../icons/location.svg";

// export default function UserAccount() {
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const stored = localStorage.getItem("pocketbase_auth");
//       if (!stored) return handleLogout("Aucun token trouvé");

//       let auth;
//       try {
//         auth = JSON.parse(stored);
//       } catch (err) {
//         return handleLogout("Token invalide : " + err.message);
//       }

//       const userId = auth?.record?.id;
//       if (!userId) return handleLogout("Identifiant manquant");

//       try {
//         const res = await fetch("/api/user", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           console.error("Erreur API :", data.error);
//         } else {
//           setUserData(data);
//         }
//       } catch (err) {
//         console.error("Erreur fetch /api/user :", err);
//       }

//       setLoading(false);
//     };

//     fetchUserData();
//   }, []);

//   const handleLogout = (msg) => {
//     console.warn("Déconnexion forcée :", msg);
//     setLoading(false);
//   };

//   if (loading) return <p className="text-white">Chargement...</p>;

//   if (!userData) {
//     return (
//       <div className="text-white">
//         <h1>User Account</h1>
//         <p>Non connecté</p>
//         <a href="/login">Connectez-vous</a>
//       </div>
//     );
//   }

//   return (
// <div className="text-white flex flex-col justify-center items-center gap-4 w-full">
//   <div className="flex justify-center items-center pt-12 w-full gap-0">
//     <div className="w-full h-3 bg-(--color-blue)"></div>
//     <svg
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 194 223"
//   fill="none"
//     className="w-[150dvw] h-auto"
// >
//   <defs>
//     <pattern
//       id="imagePattern"
//       patternUnits="userSpaceOnUse"
//       width="194"
//       height="223"
//     >
//       <image
//         href={userData.avatar || userBaseImg.src}
//         x="0"
//         y="0"
//         width="194"
//         height="223"
//         preserveAspectRatio="xMidYMid slice"
        
//       />
//     </pattern>
//   </defs>

//   <path
//     d="M190.955 57.4535L97.4428 3.46409L3.93051 57.4534L3.9305 165.432L97.4428 219.421L190.955 165.432L190.955 57.4535Z"
//     fill="url(#imagePattern)"
//     stroke="#FAFAFA"
//     strokeWidth="6"
//   />
// </svg>

//     <div className="w-full h-3 bg-(--color-violet)"></div>
//   </div>
//   <div className="flex flex-col items-center gap-6 w-full">
    
//   <h1 className="text-2xl font-bold">{userData.prenom} {userData.nom}</h1>
//   <p className="text-lg">Étudiant(e) en {userData.etudes}</p>
//   <div className="flex gap-2">
//     <img src={locationIcon.src} alt="location icon" />
//     <p>{userData.ville}</p>
//   </div>
//   <div className="flex w-full justify-around gap-2 px-16 max-w-[500px]">
//     <div className="flex flex-col items-center gap-2">
//       <p>183</p>
//       <p>Abonnés</p>
//     </div>
//     <div className="flex flex-col items-center gap-2">
//       <p>183</p>
//       <p>Abonnés</p>
//     </div>
//     <div className="flex flex-col items-center gap-2">
//       <p>183</p>
//       <p>Abonnés</p>
//     </div>
//   </div>
//   <div className="flex gap-8">
//     <button className="bg-(--color-violet) px-8 py-2 rounded">
//          Modifier
//         </button>
//     <button className="bg-(--color-violet) px-8 py-2 rounded">
//          Ajouter des amis
//         </button>
//   </div>
//   </div>
// </div>

//   );
// }


