import * as React from "react";
import {
  LocalizationProvider,
  DateCalendar,
  TimeClock,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Clear as ClearIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Alarm as AlarmIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const MINUTES_STEP = 5;

export default function DateInput({ date, setDate }) {
  const [view, setView] = React.useState("date");
  const [clockView, setClockView] = React.useState("hours");
  const [initialDate, setInitialDate] = React.useState(date);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 640);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const updateDate = (newValue) => {
    if (!newValue?.isValid?.()) return;

    const newDate = newValue.toDate();
    const oldDate = dayjs(date).isValid() ? dayjs(date) : dayjs();

    let merged;
    if (view === "date") {
      // Conserve l'heure existante
      merged = dayjs(newDate)
        .hour(oldDate.hour())
        .minute(oldDate.minute())
        .second(0);
    } else {
      // Conserve la date existante
      merged = dayjs(oldDate)
        .hour(newDate.getHours())
        .minute(newDate.getMinutes())
        .second(0);
    }

    const formatted = merged.format("YYYY-MM-DDTHH:mm:ss");
    setDate(formatted);
    setInitialDate(formatted);
  };

  const handleSetToday = () => {
    const now = dayjs().second(0).format("YYYY-MM-DDTHH:mm:ss");
    setDate(now);
    setInitialDate(now);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <div className="max-w-xs w-full mx-auto rounded-xl bg-gradient-to-br from-[#4b1d77] to-[#3b1560] text-white p-3 shadow-lg">
        <div className="bg-white/5 rounded-lg p-2 mb-2">
          <div className="text-xs opacity-80 font-light capitalize">
            {dayjs(date).isValid()
              ? dayjs(date).format("dddd D MMMM YYYY")
              : "Date non définie"}
          </div>
          <div className="text-xl font-semibold">
            {dayjs(date).isValid() ? dayjs(date).format("HH:mm") : "--:--"}
          </div>
        </div>

        <div className="flex justify-center mb-3">
          <div className="flex bg-white/5 rounded-xl border border-white/10 p-0.5">
            <button
              onClick={() => setView("date")}
              className={`px-3 py-1 rounded-lg flex items-center text-sm ${
                view === "date"
                  ? "bg-[#cc6dfc] text-white shadow-md"
                  : "text-white/80 hover:bg-white/10"
              } transition-all duration-200`}
              aria-label="vue calendrier"
            >
              <CalendarMonthIcon fontSize="small" className="mr-1" />
              Date
            </button>
            <button
              onClick={() => setView("time")}
              className={`px-3 py-1 rounded-lg flex items-center text-sm ${
                view === "time"
                  ? "bg-[#cc6dfc] text-white shadow-md"
                  : "text-white/80 hover:bg-white/10"
              } transition-all duration-200`}
              aria-label="vue horloge"
            >
              <AccessTimeIcon fontSize="small" className="mr-1" />
              Heure
            </button>
          </div>
        </div>

        <div className="rounded-lg p-2 border border-white/10 mb-3">
          {view === "date" ? (
            <DateCalendar
              key={`calendar-${date}`}
              value={dayjs(date).isValid() ? dayjs(date) : dayjs()}
              onChange={updateDate}
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                fontFamily: "'Poppins', sans-serif",
                "& .MuiPickersSlideTransition-root": {
                  overflow: "hidden !important",
                },
                "& .MuiDayCalendar-slideTransition": {
                  overflow: "hidden !important",
                },
                "& .MuiDayCalendar-monthContainer": {
                  overflow: "hidden",
                },
                "& .Mui-selected": {
                  backgroundColor: "var(--color-violet) !important",
                  color: "white !important",
                  fontWeight: "bold",
                },
                "& .MuiTypography-root": {
                  color: "white",
                  fontFamily: "'Red Hat Display', sans-serif",
                },
                "& .MuiIconButton-root": {
                  color: "white",
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "var(--color-violet)",
                  backgroundColor: "white",
                  borderRadius: "9999px",
                  width: isMobile ? "2rem" : "2.5rem",
                  height: isMobile ? "2rem" : "2.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 4px auto",
                  fontWeight: "bold",
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  fontFamily: "'Red Hat Display', sans-serif",
                },
                "& .MuiPickersDay-root": {
                  color: "white",
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  width: isMobile ? "2rem" : "2.5rem",
                  height: isMobile ? "2rem" : "2.5rem",
                  margin: "0 auto",
                  padding: isMobile ? "0" : "auto",
                  fontFamily: "'Poppins', sans-serif",
                  "&.MuiPickersDay-today": {
                    border: "2px solid rgba(255, 255, 255, 0.5)",
                  },
                },
              }}
            />
          ) : (
            <>
              <div className="flex justify-center mb-3">
                <div className="flex bg-white/5 rounded-xl border border-white/10 p-0.5">
                  <button
                    onClick={() => setClockView("hours")}
                    className={`px-3 py-1 rounded-lg flex items-center text-sm ${
                      clockView === "hours"
                        ? "bg-[#cc6dfc] text-white shadow-md"
                        : "text-white/80 hover:bg-white/10"
                    } transition-all duration-200`}
                    aria-label="réglage des heures"
                  >
                    <ScheduleIcon fontSize="small" className="mr-1" />
                    Heures
                  </button>
                  <button
                    onClick={() => setClockView("minutes")}
                    className={`px-3 py-1 rounded-lg flex items-center text-sm ${
                      clockView === "minutes"
                        ? "bg-[#cc6dfc] text-white shadow-md"
                        : "text-white/80 hover:bg-white/10"
                    } transition-all duration-200`}
                    aria-label="réglage des minutes"
                  >
                    <AlarmIcon fontSize="small" className="mr-1" />
                    Minutes
                  </button>
                </div>
              </div>
              <TimeClock
                key={`clock-${date}-${clockView}`}
                view={clockView}
                onViewChange={setClockView}
                value={dayjs(date).isValid() ? dayjs(date) : dayjs()}
                onChange={updateDate}
                ampm={false}
                minutesStep={MINUTES_STEP}
                sx={{
                  color: "white",
                  width: "100%",
                  maxWidth: isMobile ? "240px" : "280px",
                  margin: "0 auto",
                  "& .MuiClockPointer-root": {
                    backgroundColor: "#cc6dfc",
                  },
                  "& .MuiClockPointer-thumb": {
                    backgroundColor: "#cc6dfc",
                    border: "4px solid #4b1d77",
                  },
                  "& .MuiClockNumber-root": {
                    color: "white",
                    fontSize: isMobile ? "0.8rem" : "1rem",
                    "&.Mui-selected": {
                      backgroundColor: "#cc6dfc",
                      color: "#fff",
                    },
                  },
                }}
              />
            </>
          )}
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={handleSetToday}
            className="flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 text-sm"
          >
            <TodayIcon fontSize="small" className="mr-1" />
            Aujourd'hui
          </button>
          <button
            onClick={() => setDate("")}
            className="flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 text-sm"
          >
            <ClearIcon fontSize="small" className="mr-1" />
            Effacer
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
