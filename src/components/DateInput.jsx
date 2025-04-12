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
  Check as CheckIcon,
  Clear as ClearIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Alarm as AlarmIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const MINUTES_STEP = 5;

const muiStyles = {
  color: "white",
  "& .Mui-selected": {
    backgroundColor: "#cc6dfc !important",
    color: "#4b1d77 !important",
    fontWeight: "bold",
  },
  "& .MuiTypography-root": { color: "white" },
  "& .MuiIconButton-root": { color: "white" },
  "& .MuiDayCalendar-weekDayLabel": {
    color: "#4b1d77",
    backgroundColor: "white",
    borderRadius: "9999px",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 4px auto",
    fontWeight: "bold",
    fontSize: "0.875rem",
  },
  "& .MuiPickersDay-root": {
    color: "white",
    fontSize: "0.9rem",
    width: 40,
    height: 40,
    margin: "0 auto",
    "&.MuiPickersDay-today": {
      border: "2px solid rgba(255, 255, 255, 0.5)",
    },
  },
  "& .MuiClockPointer-root": {
    backgroundColor: "#cc6dfc",
  },
  "& .MuiClockPointer-thumb": {
    backgroundColor: "#cc6dfc",
    border: "4px solid #4b1d77",
  },
  "& .MuiClockNumber-root": {
    color: "white",
    "&.Mui-selected": {
      backgroundColor: "#cc6dfc",
      color: "#fff",
    },
  },
};

const Button = ({ onClick, isActive, icon, text, ariaLabel }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg flex items-center ${
      isActive
        ? "bg-[#cc6dfc] text-white shadow-md"
        : "text-white/80 hover:bg-white/10"
    } transition-all duration-200`}
    aria-label={ariaLabel}
  >
    {icon}
    <span className={icon ? "ml-1" : ""}>{text}</span>
  </button>
);

const ActionButton = ({ text, handler, icon }) => (
  <button
    onClick={handler}
    className="flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 text-sm"
  >
    {icon}
    <span className="ml-1">{text}</span>
  </button>
);

const ActionList = React.memo(({ onAccept, onClear, onSetToday }) => {
  const actions = [
    {
      text: "Aujourd'hui",
      handler: onSetToday,
      icon: <TodayIcon fontSize="small" />,
    },
    {
      text: "Effacer",
      handler: onClear,
      icon: <ClearIcon fontSize="small" />,
    },
    {
      text: "Valider",
      handler: onAccept,
      icon: <CheckIcon fontSize="small" />,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {actions.map((action) => (
        <ActionButton key={action.text} {...action} />
      ))}
    </div>
  );
});

const DateTimeDisplay = ({ date }) => {
  const formattedDate = dayjs(date).isValid()
    ? dayjs(date).format("dddd D MMMM YYYY")
    : "Date non définie";

  const formattedTime = dayjs(date).isValid()
    ? dayjs(date).format("HH:mm")
    : "--:--";

  return (
    <div className="bg-white/5 rounded-lg p-3 mb-3">
      <div className="text-sm opacity-80 font-light capitalize">
        {formattedDate}
      </div>
      <div className="text-2xl font-semibold">{formattedTime}</div>
    </div>
  );
};

const ViewSelector = ({ options, activeView, onViewChange }) => (
  <div className="flex justify-center mb-4 max-w-full">
    <div className="flex bg-white/5 rounded-xl border border-white/10 p-0.5">
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => onViewChange(option.value)}
          isActive={activeView === option.value}
          icon={option.icon}
          text={option.text}
          ariaLabel={option.ariaLabel}
        />
      ))}
    </div>
  </div>
);

export default function DateInput({ date, setDate }) {
  const [view, setView] = React.useState("date");
  const [clockView, setClockView] = React.useState("hours");
  const [initialDate, setInitialDate] = React.useState(date);

  const updateDate = (newValue) => {
    if (newValue?.isValid?.()) {
      const formatted = newValue.second(0).format("YYYY-MM-DDTHH:mm:ss");
      setDate(formatted);
      setInitialDate(formatted);
    }
  };

  const mainViewOptions = [
    {
      value: "date",
      text: "Date",
      icon: <CalendarMonthIcon fontSize="small" className="mr-1" />,
      ariaLabel: "vue calendrier",
    },
    {
      value: "time",
      text: "Heure",
      icon: <AccessTimeIcon fontSize="small" className="mr-1" />,
      ariaLabel: "vue horloge",
    },
  ];

  const clockViewOptions = [
    {
      value: "hours",
      text: "Heures",
      icon: <ScheduleIcon fontSize="small" className="mr-1" />,
      ariaLabel: "réglage des heures",
    },
    {
      value: "minutes",
      text: "Minutes",
      icon: <AlarmIcon fontSize="small" className="mr-1" />,
      ariaLabel: "réglage des minutes",
    },
  ];

  const handleSetToday = () => {
    const now = dayjs().second(0).format("YYYY-MM-DDTHH:mm:ss");
    setDate(now);
    setInitialDate(now);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <div className="rounded-3xl bg-gradient-to-br from-[#4b1d77] to-[#3b1560] text-white p-4 shadow-xl w-full flex flex-col items-center">
        <DateTimeDisplay date={date} />
        <ViewSelector
          options={mainViewOptions}
          activeView={view}
          onViewChange={setView}
        />
        <div className="rounded-xl p-2 border border-white/10 max-w-full">
          {view === "date" ? (
            <DateCalendar
              key={`calendar-${date}`}
              value={dayjs(date).isValid() ? dayjs(date) : dayjs()}
              onChange={updateDate}
              sx={muiStyles}
            />
          ) : (
            <>
              <ViewSelector
                options={clockViewOptions}
                activeView={clockView}
                onViewChange={setClockView}
              />
              <TimeClock
                key={`clock-${date}-${clockView}`}
                view={clockView}
                onViewChange={setClockView}
                value={dayjs(date).isValid() ? dayjs(date) : dayjs()}
                onChange={updateDate}
                ampm={false}
                minutesStep={MINUTES_STEP}
                sx={muiStyles}
              />
            </>
          )}
        </div>
        <ActionList
          onAccept={() => {}}
          onClear={() => setDate("")}
          onSetToday={handleSetToday}
        />
      </div>
    </LocalizationProvider>
  );
}
