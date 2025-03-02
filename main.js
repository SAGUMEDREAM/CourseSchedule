$(document).ready(function () {
    const exportCode = `(()=>{const table=document.querySelector("#cTable");const rows=table.querySelectorAll("tbody tr");const result={monday:[],tuesday:[],wednesday:[],thursday:[],friday:[],saturday:[],sunday:[]};const daysOfWeek=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];const courseRegex=/(.*)\\s?\\((.*)\\)\\s?\\((\\d+-\\d+)\\)\\s?([A-Za-z0-9]+)\\s*(.*)/;rows.forEach(row=>{const cells=row.querySelectorAll('td');cells.forEach((cell,index)=>{if(index===0)return;const courseElement=cell.querySelector(".STYLE1");if(courseElement){const courseText=String(courseElement.innerHTML).trim();if(courseText.includes('<br>')){const courses=courseText.split('<br>').map(item=>item.trim());const arr=[];courses.forEach(course=>{const parsedCourse=parseCourse(course);arr.push(parsedCourse)});result[daysOfWeek[index-1]].push([arr])}else{const parsedCourse=parseCourse(courseText);result[daysOfWeek[index-1]].push([parsedCourse])}}})});const base64String=btoa(unescape(encodeURIComponent(JSON.stringify(result))));console.log("请复制以下代码:");console.log(base64String);return JSON.stringify(result);function parseCourse(courseText){const match=courseText.match(courseRegex);if(match){return{name:match[1].trim(),id:match[2].trim(),time:match[3]?match[3].trim():'',room:match[4].trim(),teacher:match[5]?match[5].trim():''}}return null}})();`
    const app = $("#app");
    const table = $(".excel");
    const tbody = $(".tbody");
    const inputButton = $(".input");
    const reloadButton = $(".reload");
    const copyCodeButton = $(".copy-code");
    const increaseWeekButton = $(".increase_week");
    const decreaseWeekButton = $(".decrease_week");
    const data = {
        value: null
    };
    const start = {
        value: null
    };
    const semesterStartDate = new Date("2025-02-17");

    function getBeijingTime() {
        const utcTime = new Date();
        const beijingOffset = 8 * 60;
        const beijingTime = new Date(utcTime.getTime() + beijingOffset * 60000);
        return beijingTime
    }

    function calculateCurrentWeek() {
        const currentDate = getBeijingTime();
        const timeDifference = currentDate - semesterStartDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const currentWeek = Math.floor(daysDifference / 7) + 1;
        return currentWeek
    }

    const nowWeek = {
        value: calculateCurrentWeek()
    };
    for (let i = 0; i < 8; i++) {
        const headStr = ((index) => {
            switch (index) {
                case 0:
                    return "0102";
                case 1:
                    return "0304";
                case 2:
                    return "0506";
                case 3:
                    return "0708";
                case 4:
                    return "0910";
                case 5:
                    return "11";
                case 6:
                    return "12";
                case 7:
                    return "13";
                default:
                    return ""
            }
        })(i);
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = headStr;
        tr.appendChild(th);
        for (let j = 0; j < 7; j++) {
            const thColumn = document.createElement("th");
            thColumn.setAttribute('data-x', j);
            thColumn.setAttribute('data-y', i);
            tr.appendChild(thColumn)
        }
        tbody.append(tr)
    }

    function loadDataFromLocalStorage() {
        const base64Str = localStorage.getItem("data");
        const startStr = localStorage.getItem("start");
        if (startStr != null && startStr !== "") {
            start.value = Number(startStr);
        }
        if (base64Str != null && base64Str !== "") {
            try {
                const decodedData = atob(base64Str);
                const utf8Str = decodeURIComponent(escape(decodedData));
                const parsedData = JSON.parse(utf8Str);
                data.value = parsedData;
                loadHook(false)
            } catch (error) {
                console.error("Error decoding or parsing data:", error);
                alert("解码或解析数据时发生错误")
            }
        }
    }

    function setStart(value) {
        localStorage.setItem("start", value)
    }

    function inputHook() {
        const base64Str = prompt("请输入 Base64 编码的数据：");
        if (!base64Str) return;
        const startStr = prompt("请输入第一周第一天的日期（格式：2025-02-17）");
        if (!startStr) return;
        const startDate = new Date(startStr);
        if (isNaN(startDate)) {
            alert("无效的日期格式！");
            return
        }
        start.value = startDate.getTime();
        setStart(start.value);
        try {
            const decodedData = atob(base64Str);
            const utf8Str = decodeURIComponent(escape(decodedData));
            const parsedData = JSON.parse(utf8Str);
            data.value = parsedData;
            localStorage.setItem("data", base64Str);
            loadHook(false)
        } catch (error) {
            console.error(error);
            alert("解码或解析数据时发生错误")
        }
    }

    function loadHook(isLoad = false) {
        if (data.value == null && isLoad) {
            alert("数据无效");
            return
        }
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        for (let j = 0; j < 7; j++) {
            for (let i = 0; i < 8; i++) {
                const cell = document.querySelector(`[data-x="${j}"][data-y="${i}"]`);
                const lessons = data.value[days[j]][i];
                if (lessons) {
                    cell.innerHTML = "";
                    for (let k = 0; k < lessons.length; k++) {
                        const lesson = lessons[k];
                        if (Array.isArray(lesson)) {
                            for (let l = 0; l < lesson.length; l++) {
                                const lesson_sub = lesson[l];
                                if (lesson_sub) {
                                    const name = lesson_sub.name || "未知课程";
                                    const id = lesson_sub.id || "未知课程号";
                                    const time = lesson_sub.time || "未知时间";
                                    const room = lesson_sub.room || "未知地点";
                                    const teacher = lesson_sub.teacher || "未知老师";
                                    if (isWeekInRange(time, nowWeek.value)) {
                                        cell.innerHTML += `${name}<br>课程号:${id}<br>周:${time}<br>地点:${room}<br>老师:${teacher}<br><br>`
                                    }
                                }
                            }
                        } else {
                            for (let l = 0; l < lessons.length; l++) {
                                if (lesson) {
                                    const name = lesson.name || "未知课程";
                                    const id = lesson.id || "未知课程号";
                                    const time = lesson.time || "未知时间";
                                    const room = lesson.room || "未知地点";
                                    const teacher = lesson.teacher || "未知老师";
                                    if (isWeekInRange(time, nowWeek.value)) {
                                        cell.innerHTML += `${name}<br>课程号:${id}<br>周:${time}<br>地点:${room}<br>老师:${teacher}<br><br>`
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function isWeekInRange(weekRange, currentWeek) {
        if (!weekRange || weekRange === "未知时间") {
            return false
        }
        if (!weekRange.includes('-')) {
            return parseInt(weekRange) === currentWeek
        }
        const [startWeek, endWeek] = weekRange.split('-').map(num => parseInt(num));
        return currentWeek >= startWeek && currentWeek <= endWeek
    }

    function calculateMondayDate(weekNumber) {
        const firstDayOfWeek = new Date(start.value);
        const dayOfWeek = firstDayOfWeek.getDay();
        const daysToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + daysToMonday);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (weekNumber - 1) * 7);
        return firstDayOfWeek
    }

    function calculateDateByWeekAndDay(weekNumber, dayOfWeek) {
        const firstDayOfWeek = new Date(start.value);
        const dayOfWeekInStart = firstDayOfWeek.getDay();
        const daysToMonday = (dayOfWeekInStart === 0 ? -6 : 1 - dayOfWeekInStart);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + daysToMonday);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (weekNumber - 1) * 7 + dayOfWeek);
        return firstDayOfWeek
    }

    function fillWeekDates() {
        const weekElements = [{
            class: ".week1",
            day: "星期一",
            dayIndex: 1
        }, {
            class: ".week2",
            day: "星期二",
            dayIndex: 2
        }, {
            class: ".week3",
            day: "星期三",
            dayIndex: 3
        }, {
            class: ".week4",
            day: "星期四",
            dayIndex: 4
        }, {
            class: ".week5",
            day: "星期五",
            dayIndex: 5
        }, {
            class: ".week6",
            day: "星期六",
            dayIndex: 6
        }, {
            class: ".week7",
            day: "星期日",
            dayIndex: 0
        }];
        const startDate = new Date(start.value);
        if (isNaN(startDate.getTime())) {
            console.error("起始日期格式无效");
            return;
        }
        const weekNumber = parseInt(nowWeek.value, 10);
        if (isNaN(weekNumber)) {
            console.error("当前周数格式无效");
            return;
        }
        const currentWeekStartDate = new Date(startDate);
        currentWeekStartDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
        weekElements.forEach((week) => {
            const targetDate = new Date(currentWeekStartDate);
            targetDate.setDate(currentWeekStartDate.getDate() + (week.dayIndex - 1));
            const month = targetDate.getMonth() + 1;
            const day = targetDate.getDate();
            $(week.class).text(`${week.day}(${month}月${day}日)`)
        })
    }

    function updateWeekNumber() {
        const weekNumber = $(".week-number");
        const currentDate = calculateCurrentDate(nowWeek.value);
        weekNumber.html(`<span>第${nowWeek.value}周(${currentDate})</span>`);
        fillWeekDates()
    }

    function calculateCurrentDate(weekNumber) {
        const mondayDate = calculateMondayDate(weekNumber);
        return `${mondayDate.getMonth() + 1}月${mondayDate.getDate()}日`
    }

    function increaseWeekHook() {
        if (data.value == null || start.value == null) {
            alert("数据无效");
            return
        }
        nowWeek.value++;
        updateWeekNumber();
        loadHook(true)
    }

    function decreaseWeek() {
        if (data.value == null || start.value == null) {
            alert("数据无效");
            return
        }
        nowWeek.value--;
        updateWeekNumber();
        loadHook(true)
    }

    function copyCode() {
        let copyText = document.createElement("input");
        copyText.value = exportCode;
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value)
            .then(() => {
                alert("复制成功, 请前往\"课表横式\"并打开控制台粘贴")
            })
            .catch(() => {
                alert("复制失败")
        })
    }

    inputButton.on("click", inputHook);
    reloadButton.on("click", () => loadHook(true));
    increaseWeekButton.on("click", increaseWeekHook);
    decreaseWeekButton.on("click", decreaseWeek);
    copyCodeButton.on("click", copyCode)
    loadDataFromLocalStorage();
    updateWeekNumber()
});