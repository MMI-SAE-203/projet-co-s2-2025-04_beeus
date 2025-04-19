import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import calendarIcon from "../icons/calendar.svg";
import placeIcon from "../icons/place.svg";
import serverIcon from "../icons/server.svg";

const bentoData = [
  {
    title: "Recherche d'événement",
    description:
      "Trouvez et participez à des événements étudiants grâce à un moteur de recherche rapide et interactif.",
    icon: calendarIcon,
    color: "bg-(--color-violet)",
    link: "/events",
  },
  {
    title: "Recherche de lieu",
    description:
      "Explorez des lieux populaires près de vous avec une carte interactive et un système de recherche précis.",
    icon: placeIcon,
    color: "bg-(--color-blue)",
    link: "/places",
  },
  {
    title: "Serveur communautaire",
    description:
      "Discutez, partagez et échangez avec d'autres étudiants dans un espace sécurisé et dynamique dédié à votre communauté.",
    icon: serverIcon,
    color: "bg-(--color-pink)",
    link: "/server",
  },
];

const BentoGrid = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bentoData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (index) => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getGridPosition = (index) => {
    if (activeIndex === 0) return index === 0 ? "row-start-1" : "row-start-2";
    if (activeIndex === 1) return index === 1 ? "row-start-2" : "row-start-1";
    if (activeIndex === 2) return index === 2 ? "row-start-2" : "row-start-1";
  };

  return (
    <div className="grid grid-cols-2 auto-rows-auto gap-4 max-w-4xl mx-auto px-4 md:px-8 lg:px-32 font-body">
      {bentoData.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <motion.div
            key={index}
            onClick={() => handleClick(index)}
            className={`
              relative rounded-2xl bg-zinc-900/80 text-white cursor-pointer 
              overflow-hidden flex flex-col items-center justify-center text-center
              ${getGridPosition(index)} ${
              isActive ? "col-span-2" : "col-span-1"
            }
            `}
            layout
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 30 },
              height: { duration: 0.4 },
            }}
            animate={{
              height: isActive ? 280 : 130,
            }}
          >
            <motion.div
              className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${item.color}`}
              animate={{
                scale: isActive ? 1.2 : 1,
                y: isActive ? -8 : 0,
              }}
              transition={{ duration: 0.4 }}
            >
              <img src={item.icon.src} alt="" className="w-6 h-6" />
            </motion.div>

            <motion.h3
              className="text-lg font-bold px-4 mt-2 z-10 font-title"
              animate={{
                fontSize: isActive ? "1.25rem" : "1rem",
              }}
              transition={{ duration: 0.3 }}
            >
              {item.title}
            </motion.h3>

            <motion.div
              className="px-6 w-full z-10"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                height: isActive ? "auto" : 0,
                y: isActive ? 0 : 10,
              }}
              transition={{
                duration: 0.3,
                delay: isActive ? 0.2 : 0,
              }}
            >
              <p className="text-sm text-gray-300 mt-3">{item.description}</p>
              <motion.a
                href={item.link}
                className={`inline-block mt-4 px-4 py-1 text-sm rounded-full no-underline text-white ${item.color} hover:brightness-110 transition`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                En savoir plus
              </motion.a>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BentoGrid;
