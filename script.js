
const STORAGE_KEY = "g7_syllabus_tracker";

let courses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let activeCourseId = null;
let activeFilter = "all";

const app = document.getElementById("app");


function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}


function generateId() {
    return Date.now().toString() + Math.random().toString().slice(2, 7);
}


function calculateProgress(course) {

    let totalTopics = 0;
    let completedTopics = 0;

    for (let i = 0; i < course.units.length; i++) {

        for (let j = 0; j < course.units[i].topics.length; j++) {

            totalTopics++;

            if (course.units[i].topics[j].completed === true) {
                completedTopics++;
            }
        }
    }

    let percentage = 0;

    if (totalTopics > 0) {
        percentage = Math.round((completedTopics / totalTopics) * 100);
    }

    return {
        totalTopics: totalTopics,
        completedTopics: completedTopics,
        percentage: percentage
    };
}


function createCourse(name) {

    if (name.trim() === "") {
        alert("Please enter a course name.");
        return;
    }

    let course = {
        id: generateId(),
        name: name.trim(),
        units: []
    };

    for (let i = 1; i <= 5; i++) {

        let unit = {
            id: generateId(),
            name: "Unit " + i,
            topics: []
        };

        course.units.push(unit);
    }

    courses.push(course);

    saveData();

    renderDashboard();
}


function addTopic(courseId, unitId, topicName) {

    if (topicName.trim() === "") {
        alert("Please enter a topic name.");
        return;
    }

    let course = courses.find(function(c) {
        return c.id === courseId;
    });

    if (!course) {
        return;
    }

    let unit = course.units.find(function(u) {
        return u.id === unitId;
    });

    if (!unit) {
        return;
    }

    let topic = {
        id: generateId(),
        name: topicName.trim(),
        completed: false,
        difficulty: "Easy",
        note: ""
    };

    unit.topics.push(topic);

    saveData();

    renderCourse(courseId);
}


function toggleTopic(courseId, topicId) {

    let course = courses.find(function(c) {
        return c.id === courseId;
    });

    if (!course) {
        return;
    }

    for (let i = 0; i < course.units.length; i++) {

        for (let j = 0; j < course.units[i].topics.length; j++) {

            let topic = course.units[i].topics[j];

            if (topic.id === topicId) {
                topic.completed = !topic.completed;
                break;
            }
        }
    }

    saveData();

    renderCourse(courseId);
}


function updateDifficulty(courseId, topicId, difficulty) {

    let course = courses.find(function(c) {
        return c.id === courseId;
    });

    if (!course) {
        return;
    }

    for (let i = 0; i < course.units.length; i++) {

        for (let j = 0; j < course.units[i].topics.length; j++) {

            let topic = course.units[i].topics[j];

            if (topic.id === topicId) {
                topic.difficulty = difficulty;
            }
        }
    }

    saveData();

    renderCourse(courseId);
}


function updateNote(courseId, topicId, note) {

    let course = courses.find(function(c) {
        return c.id === courseId;
    });

    if (!course) {
        return;
    }

    for (let i = 0; i < course.units.length; i++) {

        for (let j = 0; j < course.units[i].topics.length; j++) {

            let topic = course.units[i].topics[j];

            if (topic.id === topicId) {
                topic.note = note;
            }
        }
    }

    saveData();
}


function getFilteredTopics(topics) {

    if (activeFilter === "all") {
        return topics;
    }

    if (activeFilter === "completed") {
        return topics.filter(function(topic) {
            return topic.completed === true;
        });
    }

    if (activeFilter === "pending") {
        return topics.filter(function(topic) {
            return topic.completed === false;
        });
    }

    if (activeFilter === "tough") {
        return topics.filter(function(topic) {
            return topic.difficulty === "Tough - Needs Revision";
        });
    }

    return topics;
}


function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        let entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


function renderDashboard() {

    activeCourseId = null;

    let html = `
        <header class="app-header">
            <h1>📚 Syllabus Tracker</h1>
            <p>Organize your learning. Track your progress.</p>
        </header>

        <section class="course-creation">
            <h2>Create a New Course</h2>

            <form id="course-form">
                <input
                    type="text"
                    id="course-name"
                    placeholder="Enter subject name"
                    required
                >

                <button type="submit">+ Add Course</button>
            </form>
        </section>

        <section class="courses-section">
            <h2>My Courses</h2>
            <div class="course-grid">
    `;

    if (courses.length === 0) {
        html += "<p>No courses yet. Create your first course!</p>";
    }

    for (let i = 0; i < courses.length; i++) {

        let course = courses[i];
        let progress = calculateProgress(course);

        html += `
            <article class="course-card">
                <h3>${escapeHTML(course.name)}</h3>

                <div class="progress-bar">
                    <div class="progress-fill"
                        style="width: ${progress.percentage}%">
                    </div>
                </div>

                <p>${progress.percentage}% completed</p>

                <p>
                    ${progress.completedTopics}
                    / ${progress.totalTopics} topics completed
                </p>

                <button class="open-course"
                    data-course="${course.id}">
                    Open Course
                </button>
            </article>
        `;
    }

    html += `
            </div>
        </section>
    `;

    app.innerHTML = html;
}


function renderCourse(courseId) {

    let course = courses.find(function(c) {
        return c.id === courseId;
    });

    if (!course) {
        renderDashboard();
        return;
    }

    activeCourseId = courseId;

    let progress = calculateProgress(course);

    let html = `
        <button id="back-dashboard">← Back to Dashboard</button>

        <header class="course-header">
            <h1>${escapeHTML(course.name)}</h1>

            <h2>Overall Progress: ${progress.percentage}%</h2>

            <div class="progress-bar">
                <div class="progress-fill"
                    style="width: ${progress.percentage}%">
                </div>
            </div>

            <p>
                ${progress.completedTopics}
                of ${progress.totalTopics} topics completed
            </p>
        </header>

        <section class="filter-section">
            <label for="topic-filter">Filter Topics:</label>

            <select id="topic-filter">
                <option value="all">All Topics</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="tough">Needs Revision</option>
            </select>
        </section>
    `;

    for (let i = 0; i < course.units.length; i++) {

        let unit = course.units[i];

        let visibleTopics = getFilteredTopics(unit.topics);

        html += `
            <section class="unit-card">
                <h2>${escapeHTML(unit.name)}</h2>

                <form class="topic-form" data-unit="${unit.id}">
                    <input
                        type="text"
                        name="topicName"
                        placeholder="Enter a new topic"
                        required
                    >

                    <button type="submit">Add Topic</button>
                </form>

                <div class="topic-list">
        `;

        if (visibleTopics.length === 0) {
            html += "<p>No topics to display.</p>";
        }

        for (let j = 0; j < visibleTopics.length; j++) {

            let topic = visibleTopics[j];

            html += `
                <article class="topic-card">

                    <label class="topic-title">
                        <input
                            type="checkbox"
                            class="topic-checkbox"
                            data-topic="${topic.id}"
                            ${topic.completed ? "checked" : ""}
                        >

                        <span>${escapeHTML(topic.name)}</span>
                    </label>

                    <select
                        class="difficulty-select"
                        data-topic="${topic.id}"
                    >
                        <option value="Easy"
                            ${topic.difficulty === "Easy" ? "selected" : ""}>
                            Easy
                        </option>

                        <option value="Moderate"
                            ${topic.difficulty === "Moderate" ? "selected" : ""}>
                            Moderate
                        </option>

                        <option value="Tough - Needs Revision"
                            ${topic.difficulty === "Tough - Needs Revision" ? "selected" : ""}>
                            Tough - Needs Revision
                        </option>
                    </select>

                    <label>Quick Notes</label>

                    <textarea
                        class="topic-note"
                        data-topic="${topic.id}"
                        placeholder="Write formulas or textbook references..."
                    >${escapeHTML(topic.note)}</textarea>

                </article>
            `;
        }

        html += `
                </div>
            </section>
        `;
    }

    app.innerHTML = html;

    document.getElementById("topic-filter").value = activeFilter;
}


app.addEventListener("submit", function(event) {

    event.preventDefault();

    if (event.target.id === "course-form") {

        let name = document.getElementById("course-name").value;

        createCourse(name);
    }

    if (event.target.classList.contains("topic-form")) {

        let unitId = event.target.dataset.unit;

        let topicName = event.target.elements.topicName.value;

        addTopic(activeCourseId, unitId, topicName);
    }
});


app.addEventListener("click", function(event) {

    let button = event.target.closest(".open-course");

    if (button) {
        renderCourse(button.dataset.course);
    }

    if (event.target.id === "back-dashboard") {
        activeFilter = "all";
        renderDashboard();
    }
});


app.addEventListener("change", function(event) {

    if (event.target.classList.contains("topic-checkbox")) {

        toggleTopic(
            activeCourseId,
            event.target.dataset.topic
        );
    }

    if (event.target.classList.contains("difficulty-select")) {

        updateDifficulty(
            activeCourseId,
            event.target.dataset.topic,
            event.target.value
        );
    }

    if (event.target.id === "topic-filter") {

        activeFilter = event.target.value;

        renderCourse(activeCourseId);
    }

});


app.addEventListener("input", function(event) {

    if (event.target.classList.contains("topic-note")) {

        updateNote(
            activeCourseId,
            event.target.dataset.topic,
            event.target.value
        );
    }
});


renderDashboard();