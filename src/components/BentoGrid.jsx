import { useState, useEffect, useRef } from "react";
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
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % bentoData.length);
    }, 3000);
  };

  useEffect(() => {
    startTimer();
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    startTimer();
    return () => clearTimeout(timerRef.current);
  }, [activeIndex]);

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
    <div className="grid grid-cols-2 auto-rows-auto gap-6 md:gap-8 lg:gap-10 max-w-5xl mx-auto px-4 md:px-8 lg:px-32 font-body">
      {bentoData.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <motion.div
            key={index}
            onClick={() => handleClick(index)}
            className={`relative rounded-3xl bg-zinc-900/70 backdrop-blur-md shadow-lg overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer transition-shadow duration-300 hover:shadow-2xl ${getGridPosition(
              index
            )} ${isActive ? "col-span-2" : "col-span-1"}`}
            initial={{ opacity: 1, y: 25, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isActive ? 300 : 150,
            }}
            transition={{
              y: { duration: 0.6, delay: index * 0.08, ease: "easeOut" },
              scale: { duration: 0.6, delay: index * 0.08, ease: "easeOut" },
              layout: { type: "spring", stiffness: 250, damping: 26 },
              height: { duration: 0.5 },
            }}
            whileHover={!isActive ? { scale: 1.02 } : {}}
            layout
          >
            <motion.div
              className={`w-14 h-14 rounded-full flex items-center justify-center z-10 ${item.color} shadow-md`}
              animate={{
                scale: isActive ? 1.25 : 1,
                y: isActive ? -10 : 0,
              }}
              transition={{ duration: 0.4 }}
            >
              <img src={item.icon.src} alt="" className="w-6 h-6" />
            </motion.div>

            <motion.h3
              className="mt-3 px-4 font-title font-semibold tracking-wide z-10"
              animate={{ fontSize: isActive ? "1.35rem" : "1.125rem" }}
              transition={{ duration: 0.3 }}
            >
              {item.title}
            </motion.h3>

            <motion.div
              className="px-8 w-full z-10"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                height: isActive ? "auto" : 0,
                y: isActive ? 0 : 12,
              }}
              transition={{ duration: 0.35, delay: isActive ? 0.25 : 0 }}
            >
              <p className="text-sm text-gray-300 leading-relaxed mt-4">
                {item.description}
              </p>
              <motion.a
                href={item.link}
                className={`inline-block mt-5 px-5 py-2 text-sm rounded-full no-underline text-white ${item.color} hover:brightness-110 focus:scale-[1.02] transition-transform`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                En savoir plus
              </motion.a>
            </motion.div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-white/5" />
          </motion.div>
        );
      })}
    </div>
  );
};

export default BentoGrid;
