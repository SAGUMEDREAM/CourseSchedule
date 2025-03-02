(() => {
    const table = document.querySelector("#cTable");
    const rows = table.querySelectorAll("tbody tr");

    const result = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    };

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // 用于解析课程信息的正则表达式
    const courseRegex = /(.*)\s?\((.*)\)\s?\((\d+-\d+)\)\s?([A-Za-z0-9]+)\s*(.*)/;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');

        cells.forEach((cell, index) => {
            if (index === 0) return;

            const courseElement = cell.querySelector(".STYLE1");

            if (courseElement) {
                const courseText = String(courseElement.innerHTML).trim();

                if (courseText.includes('<br>')) {
                    const courses = courseText.split('<br>').map(item => item.trim());
                    const arr = [];
                    courses.forEach(course => {
                        const parsedCourse = parseCourse(course);
                        arr.push(parsedCourse)
                    });
                    result[daysOfWeek[index - 1]].push([arr]);
                } else {
                    const parsedCourse = parseCourse(courseText);
                    result[daysOfWeek[index - 1]].push([parsedCourse]);
                }
            }
        });
    });
    const base64String = btoa(unescape(encodeURIComponent(JSON.stringify(result))));
    console.log("请复制以下代码:");
    console.log(base64String);

    return JSON.stringify(result);

    function parseCourse(courseText) {
        const match = courseText.match(courseRegex);
        if (match) {
            return {
                name: match[1].trim(),
                id: match[2].trim(),
                time: match[3] ? match[3].trim() : '',
                room: match[4].trim(),
                teacher: match[5] ? match[5].trim() : ''
            };
        }
        return null;
    }
})();
