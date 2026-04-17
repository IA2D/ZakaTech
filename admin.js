let barChartInstance = null;
let pieChartInstance = null;
let allResults = [];
let allUsers = [];

window.addEventListener("load", () => {
  loadTheme();

  // Check if admin is logged in via API token
  if (api.isAuthenticated()) {
    // Verify admin status
    api.getCurrentUser().then(user => {
      if (user.isAdmin) {
        document.getElementById("adminLoginSection").classList.add("hidden");
        document.getElementById("adminPanel").classList.remove("hidden");
        loadAdminResults();
      } else {
        api.logout();
      }
    }).catch(() => {
      api.logout();
    });
  }
});

/* Theme */
const themeToggle = document.getElementById("themeToggle");

themeToggle?.addEventListener("click", toggleTheme);

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem("themeMode", isLight ? "light" : "dark");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
  loadAdminResults();
}

function loadTheme() {
  const savedTheme = localStorage.getItem("themeMode");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    if (themeToggle) themeToggle.textContent = "🌙";
  }
}

/* Login */
async function adminLogin() {
  const email = document.getElementById("adminEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("adminPassword").value.trim();
  const msg = document.getElementById("adminMsg");

  if (!email || !password) {
    msg.textContent = "أدخل البريد الإلكتروني وكلمة المرور.";
    msg.style.color = "#ef4444";
    return;
  }

  try {
    const data = await api.login({ email, password });

    if (!data.user.isAdmin) {
      msg.textContent = "ليس لديك صلاحية الأدمن.";
      msg.style.color = "#ef4444";
      api.logout();
      return;
    }

    document.getElementById("adminLoginSection").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    msg.textContent = "";
    loadAdminResults();
  } catch (error) {
    msg.textContent = error.message || "فشل تسجيل الدخول.";
    msg.style.color = "#ef4444";
  }
}

function logoutAdmin() {
  api.logout();
  location.reload();
}

/* Load Results */
async function loadAdminResults() {
  try {
    // Load results and users from API
    const [resultsData, usersData] = await Promise.all([
      api.getAllResults(),
      api.getAllUsers()
    ]);

    allResults = resultsData || [];
    allUsers = usersData || [];

    let results = [...allResults];

    const sortType = document.getElementById("sortResults")?.value || "latest";
    const searchValue =
      document.getElementById("searchInput")?.value.trim().toLowerCase() || "";

    if (sortType === "highest") {
      results.sort((a, b) => b.percentage - a.percentage);
    } else if (sortType === "lowest") {
      results.sort((a, b) => a.percentage - b.percentage);
    } else if (sortType === "level") {
      const order = {
        ممتاز: 1,
        جيد: 2,
        مقبول: 3,
        "يحتاج إلى تدريب": 4,
      };
      results.sort((a, b) => order[a.level] - order[b.level]);
    } else if (sortType === "name") {
      results.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "ar"));
    } else {
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (searchValue) {
      results = results.filter((item) =>
        (item.full_name || "").toLowerCase().includes(searchValue) ||
        (item.email || "").toLowerCase().includes(searchValue)
      );
    }

    updateStats(results);
    renderResults(results);
    renderBarChart(results);
    renderPieChart(results);
  } catch (error) {
    console.error('Failed to load admin results:', error);
    document.getElementById("resultsGrid").innerHTML =
      '<p class="empty-text">حدث خطأ أثناء تحميل البيانات.</p>';
  }
}

/* Stats */
function updateStats(results) {
  const total = results.length;
  const highest = total ? Math.max(...results.map((r) => r.percentage)) : 0;
  const average = total
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / total)
    : 0;
  const excellent = results.filter((r) => r.level === "ممتاز").length;

  document.getElementById("totalResultsCount").textContent = total;
  document.getElementById("highestScore").textContent = `${highest}%`;
  document.getElementById("averageScore").textContent = `${average}%`;
  document.getElementById("excellentCount").textContent = excellent;
}

/* Render Results */
function renderResults(results) {
  const list = document.getElementById("adminResultsList");

  if (!results.length) {
    list.innerHTML = `<p class="empty-text">لا توجد نتائج محفوظة حتى الآن.</p>`;
    window.filteredResults = [];
    return;
  }

  list.innerHTML = results
    .map(
      (item, index) => `
    <div class="admin-result-card">
      <div class="admin-result-head">
        <h3>${item.full_name || '-'}</h3>
        <span class="level-badge ${getLevelClass(item.level)}">${item.level}</span>
      </div>

      <div class="admin-result-body">
        <p><strong>البريد:</strong> ${item.email || '-'}</p>
        <p><strong>العمر:</strong> ${item.age || '-'}</p>
        <p><strong>النوع:</strong> ${item.gender || '-'}</p>
        <p><strong>المرحلة الدراسية:</strong> ${item.stage || '-'}</p>
        <p><strong>الاختبار:</strong> ${item.test_name || '-'}</p>
        <p><strong>العالم:</strong> ${item.scientist || '-'}</p>
        <p><strong>الدرجة:</strong> ${item.score || 0}/${item.total || 0}</p>
        <p><strong>النسبة:</strong> ${item.percentage || 0}%</p>
        <p><strong>التاريخ:</strong> ${item.created_at ? new Date(item.created_at).toLocaleString("ar-EG") : '-'}</p>
      </div>

      <div class="admin-card-actions">
        <button class="btn btn-soft" onclick="deleteSingleResult(${index})">حذف النتيجة</button>
      </div>
    </div>
  `,
    )
    .join("");

  window.filteredResults = results;
}

/* Delete Single */
async function deleteSingleResult(index) {
  if (!confirm("هل تريد حذف هذه النتيجة؟")) return;

  const target = window.filteredResults[index];
  if (!target) return;

  try {
    await api.deleteResult(target.id);
    loadAdminResults();
  } catch (error) {
    console.error('Failed to delete result:', error);
    alert('فشل حذف النتيجة.');
  }
}

/* Delete All - Admin can delete all for a specific user */
async function deleteUserResults(userId) {
  if (!confirm("هل أنت متأكد من حذف جميع نتائج هذا المستخدم؟")) return;

  try {
    await api.deleteUser(userId);
    loadAdminResults();
  } catch (error) {
    console.error('Failed to delete user:', error);
    alert('فشل حذف المستخدم.');
  }
}

/* Export */
async function exportResults() {
  try {
    const results = await api.getAllResults();

    if (!results || !results.length) {
      alert("لا توجد نتائج لتصديرها.");
      return;
    }

    let csv = "Name,Email,Test,Scientist,Score,Percentage,Level,Date\n";
    results.forEach((r) => {
      csv += `"${r.full_name || ''}","${r.email || ''}","${r.test_name || ''}","${r.scientist || ''}",${r.score || 0}/${r.total || 0},${r.percentage || 0}%,"${r.level || ''}","${new Date(r.created_at).toLocaleString("ar-EG")}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zeka-tech-results-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export:', error);
    alert('فشل تصدير النتائج.');
  }
}

/* Charts */
function renderBarChart(results) {
  const ctx = document.getElementById("resultsChart");
  if (!ctx) return;

  const counts = {
    ممتاز: 0,
    جيد: 0,
    مقبول: 0,
    "يحتاج إلى تدريب": 0,
  };

  results.forEach((r) => {
    if (counts[r.level] !== undefined) {
      counts[r.level]++;
    }
  });

  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "عدد النتائج",
          data: Object.values(counts),
          backgroundColor: ["#10b981", "#2563eb", "#f59e0b", "#ef4444"],
          borderRadius: 14,
          borderSkipped: false,
        },
      ],
    },
    options: getChartOptions(),
  });
}

function renderPieChart(results) {
  const ctx = document.getElementById("pieChart");
  if (!ctx) return;

  const counts = {
    ممتاز: 0,
    جيد: 0,
    مقبول: 0,
    "يحتاج إلى تدريب": 0,
  };

  results.forEach((r) => {
    if (counts[r.level] !== undefined) {
      counts[r.level]++;
    }
  });

  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ["#10b981", "#2563eb", "#f59e0b", "#ef4444"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.body).getPropertyValue("--text"),
            font: { family: "Cairo", size: 13 },
          },
        },
      },
    },
  });
}

function getChartOptions() {
  const textColor =
    getComputedStyle(document.body).getPropertyValue("--text").trim() || "#fff";

  return {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { family: "Cairo", size: 13 },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: { family: "Cairo", size: 13 },
        },
        grid: {
          color: "rgba(148,163,184,.14)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          stepSize: 1,
          font: { family: "Cairo", size: 13 },
        },
        grid: {
          color: "rgba(148,163,184,.14)",
        },
      },
    },
  };
}

function getLevelClass(level) {
  if (level === "ممتاز") return "excellent";
  if (level === "جيد") return "good";
  if (level === "مقبول") return "average";
  return "low";
}
