import { useState, useEffect } from "react";
import calendarIcon from "../icons/calendar.svg";
import locationIcon from "../icons/location.svg";
import serverIcon from "../icons/server.svg";

const carouselData = [
  {
    title: "Recherche d'événement",
    description:
      "Trouvez et participez à des événements étudiants grâce à un moteur de recherche rapide et interactif.",
    icon: calendarIcon,
    link: "/event",
  },
  {
    title: "Recherche de lieu",
    description:
      "Explorez des lieux populaires près de vous avec une carte interactive et un système de recherche précis.",
    icon: locationIcon,
    link: "/location",
  },
  {
    title: "Serveur communautaire",
    description:
      "Discutez, partagez et échangez avec d'autres étudiants dans un espace sécurisé et dynamique dédié à votre communauté.",
    icon: serverIcon,
    link: "/server",
  },
];

export default function HomeCarousel() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mx-auto px-4 py-6 text-white flex flex-col items-center rounded-2xl lg:flex-row lg:justify-between lg:px-8 lg:py-10 lg:gap-8 max-w-[700px] lg:max-w-[1200px]">
      <div className="w-full h-full flex justify-center items-center">
        <div className="relative bg-zinc-900/90 rounded-2xl backdrop-blur-md w-full flex flex-col items-center px-5 py-6 text-center shadow-2xl min-h-[300px] max-h-[500px] overflow-y-auto justify-between sm:px-6 sm:py-8 md:flex-row md:gap-6 md:w-fit md:py-12 md:overflow-visible md:px-16 lg:gap-10 lg:py-16 lg:w-full lg:justify-between lg:items-center lg:min-h-[60dvh] lg:h-full">
          <div className="flex items-center justify-center w-[10dvh] h-[10dvh] lg:w-[10dvw] lg:h-[10dvw] px-4 py-4">
            <img
              src={carouselData[activeStep].icon.src}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 max-w-xl items-center justify-between">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-violet-200">
              {carouselData[activeStep].title}
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-zinc-100 leading-relaxed text-center max-w-full md:max-w-[80%] lg:max-w-[90%]">
              {carouselData[activeStep].description}
            </p>
            <a
              href={carouselData[activeStep].link}
              className="bg-(--color-violet) px-6 py-3 rounded-xl text-sm font-medium shadow-lg max-w-[250px] self-center"
            >
              <span className="flex items-center justify-center gap-2">
                En savoir plus
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transition-transform "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="h-6 flex items-center justify-center my-4 lg:my-0 lg:h-full lg:w-12">
        <div className="flex items-center gap-4 lg:flex-col lg:justify-center lg:items-center">
          {carouselData.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all ${
                activeStep === index ? "bg-white shadow-md" : "bg-white/20"
              }`}
              onClick={() => setActiveStep(index)}
              aria-label={`Voir ${carouselData[index].title}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full flex justify-center items-stretch gap-4 sm:gap-6 lg:flex-col lg:gap-8 lg:h-full lg:w-1/4">
        {[1, 2].map((offset, idx) => {
          const step = (activeStep + offset) % carouselData.length;
          return (
            <div
              key={idx}
              className="bg-zinc-900/90 rounded-2xl backdrop-blur-md w-full flex-1 flex items-center justify-center cursor-pointer transition-all py-4 text-center"
              onClick={() => setActiveStep(step)}
            >
              <div className="flex flex-col h-full justify-start items-center gap-3 px-4 py-2 lg:p-4">
                <img
                  src={carouselData[step].icon.src}
                  alt=""
                  className="h-8 lg:h-10 opacity-90"
                />
                <span className="text-sm text-zinc-200 font-medium">
                  {carouselData[step].title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
