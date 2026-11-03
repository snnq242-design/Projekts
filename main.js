"use strict";


const events = [
    {
        date: "2026-11-11",
        day: "11",
        month: "NOV",
        title: "Lāčplēša dienas atceres brīdis",
        description: "Godinām Latvijas brīvības cīnītājus un iededzam gaismu kopā.",
        type: "Skolas pasākums",
        group: "all",
        time: "16.00",
        place: "Skolas pagalms",
    },
    {
        date: "2026-11-17",
        day: "17",
        month: "NOV",
        title: "Latvijas dzimšanas dienas koncerts",
        description: "Svētku noskaņa, skolēnu priekšnesumi un kopā būšanas prieks.",
        type: "Svētki",
        group: "all",
        time: "12.00",
        place: "Aktu zāle",
    },
    {
        date: "2026-11-25",
        day: "25",
        month: "NOV",
        title: "Vecāku un skolotāju tikšanās",
        description: "Sarunas par mācību gaitām, sasniegumiem un turpmākajiem mērķiem.",
        type: "Vecāku sapulce",
        group: "5–9",
        time: "18.00",
        place: "Klašu telpas",
    },
    {
        date: "2026-12-21",
        day: "21",
        month: "DEC",
        title: "Ziemas brīvlaika sākums",
        description: "Atpūtas un svētku laiks. Lai siltas un priecīgas brīvdienas!",
        type: "Brīvlaiks",
        group: "all",
        time: "Visa diena",
        place: "Visām klasēm",
    },
];

const $ = (id) => document.getElementById(id);

const menuBtn = $("menu");
const nav = $("nav");

if (menuBtn && nav) {
    menuBtn.onclick = () => {
        const isOpen = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
        menuBtn.textContent = isOpen ? "Aizvērt" : "Izvēlne";
    };

    document.querySelectorAll("nav a").forEach((link) => {
        link.onclick = () => {
            nav.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.textContent = "Izvēlne";
        };
    });
}

const calendarEl = $("calendar");
if (calendarEl) {
    let currentMonth = new Date(2026, 10, 1); // Novembris 2026

    const escapeHTML = (str) =>
        String(str).replace(
            /[&<>"']/g,
            (tag) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[tag]
        );

    function renderCalendar() {
        const classFilter = $("classFilter").value;
        const typeFilter = $("typeFilter").value;
        const fromDate = $("fromDate").value;
        const toDate = $("toDate").value;
        const isDateInvalid = fromDate && toDate && fromDate > toDate;

        $("filterError").textContent = isDateInvalid
            ? "Sākuma datums nedrīkst būt vēlāk par beigu datumu."
            : "";

        const year = currentMonth.getFullYear();
        const monthIndex = currentMonth.getMonth();
        const totalDays = new Date(year, monthIndex + 1, 0).getDate();
        const startDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

        $("monthTitle").textContent = currentMonth.toLocaleDateString("lv-LV", {
            month: "long",
            year: "numeric",
        });

        const filteredEvents = isDateInvalid
            ? []
            : events.filter((ev) => {
                  const evDate = new Date(ev.date + "T12:00:00");
                  return (
                      evDate.getFullYear() === year &&
                      evDate.getMonth() === monthIndex &&
                      (classFilter === "all" || ev.group === "all" || ev.group === classFilter) &&
                      (typeFilter === "all" || ev.type === typeFilter) &&
                      (!fromDate || ev.date >= fromDate) &&
                      (!toDate || ev.date <= toDate)
                  );
              });

        let calendarGridHTML = ["Pirm.", "Otr.", "Treš.", "Cet.", "Piekt.", "Sest.", "Svētd."]
            .map((dayName) => `<div class="weekday">${dayName}</div>`)
            .join("");

        const totalCells = Math.ceil((startDayOffset + totalDays) / 7) * 7;
        for (let i = 0; i < totalCells; i++) {
            let dayNum = i - startDayOffset + 1;
            if (dayNum < 1 || dayNum > totalDays) {
                calendarGridHTML += '<div class="day blank" aria-hidden="true"></div>';
                continue;
            }

            const dateStr =
                year +
                "-" +
                String(monthIndex + 1).padStart(2, "0") +
                "-" +
                String(dayNum).padStart(2, "0");
            const isToday = new Date().toLocaleDateString("sv-SE") === dateStr;

            calendarGridHTML += `
                <div class="day${isToday ? " today" : ""}">
                    <time datetime="${dateStr}">${dayNum}</time>
                    ${filteredEvents
                        .filter((ev) => ev.date === dateStr)
                        .map((ev) => `<span class="dayevent">${escapeHTML(ev.title)}</span>`)
                        .join("")}
                </div>
            `;
        }

        calendarEl.innerHTML = calendarGridHTML;

        const eventListEl = $("eventList");
        if (eventListEl) {
            eventListEl.innerHTML = filteredEvents.length
                ? filteredEvents
                      .map(
                          (ev) => `
                        <article class="event">
                            <div class="eventtop">
                                <time class="date" datetime="${ev.date}">
                                    ${ev.day}<small>${ev.month}</small>
                                </time>
                                <span class="pill">${escapeHTML(ev.type)}</span>
                            </div>
                            <h3>${escapeHTML(ev.title)}</h3>
                            <p>${escapeHTML(ev.description)}</p>
                            <div class="eventfoot">
                                <span>${escapeHTML(ev.time + " · " + ev.place)}</span>
                            </div>
                        </article>
                    `
                      )
                      .join("")
                : '<p class="empty">Šajā mēnesī nav atlasītajiem kritērijiem atbilstošu notikumu.</p>';
        }
    }

    ["classFilter", "typeFilter", "fromDate", "toDate"].forEach((id) =>
        $(id).addEventListener("change", renderCalendar)
    );

    $("previous").onclick = () => {
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        renderCalendar();
    };

    $("next").onclick = () => {
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        renderCalendar();
    };

    $("reset").onclick = () => {
        $("classFilter").value = "all";
        $("typeFilter").value = "all";
        $("fromDate").value = "";
        $("toDate").value = "";
        renderCalendar();
    };

    renderCalendar();
}

const authForm = $("authForm");
if (authForm)
    var isRegisterMode = false;

    function switchAuthMode(isRegister) {
        isRegisterMode = isRegister;
        ["nameWrap", "roleWrap", "consentWrap", "confirmWrap"].forEach((id) =>
            $(id).classList.toggle("hidden", !isRegister)
        );
        ["fullName", "role", "consent", "confirmPassword"].forEach((id) => ($(id).disabled = !isRegister));$("fullName").required = isRegister;
        $("consent").required = isRegister;

        const identityLabel = $("identity").closest("label");
        if (identityLabel && identityLabel.childNodes[0]) {
            identityLabel.childNodes[0].nodeValue = isRegister ? "E-pasts " : "E-pasts vai lietotājvārds ";
        }

        $("password").autocomplete = isRegister ? "new-password" : "current-password";
        $("submitAuth").textContent = isRegister ? "Izveidot kontu" : "Pieslēgties";
        
        $("loginTab").classList.toggle("selected", !isRegister);
        $("registerTab").classList.toggle("selected", isRegister);
        $("loginTab").setAttribute("aria-pressed", String(!isRegister));
        $("registerTab").setAttribute("aria-pressed", String(isRegister));

        document.querySelectorAll(".error").forEach((el) => {
            if (el.id !== "filterError") el.textContent = "";
        });
        document.querySelectorAll("#auth input").forEach((el) => el.setCustomValidity(""));
    }
