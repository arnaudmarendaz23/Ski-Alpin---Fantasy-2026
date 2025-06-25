fetch('courses.json')
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector('#courses-table tbody');
    tableBody.innerHTML = ''; // Réinitialisation avant ajout

    const events = data["Calendar Event"];
    events.forEach(course => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.Date}</td>
        <td>${course.Country}</td>
        <td>${course.Place}</td>
        <td>${course.Event}</td>
      `;
      tableBody.appendChild(row);

      const dates = expandDateRange(course.Date, course.Event.split(','));
      if (dates.length > 1) {
        const detailsRow = document.createElement('tr');
        const detailsCell = document.createElement('td');
        detailsCell.colSpan = 4;
        detailsCell.innerHTML = `<div class="details">${dates.map(d => `<div>${d.date} - ${d.event}</div>`).join('')}</div>`;
        detailsRow.appendChild(detailsCell);
        detailsRow.classList.add('details-row');
        detailsRow.style.display = 'none';
        tableBody.appendChild(detailsRow);

        row.style.cursor = 'pointer'; // Indique cliquable
        row.addEventListener('click', () => {
          detailsRow.style.display = (detailsRow.style.display === 'table-row') ? 'none' : 'table-row';
        });
      }
    });
  })
  .catch(error => console.error('Erreur chargement calendrier:', error));

// Fonction pour décomposer la plage de dates en dates individuelles
function expandDateRange(dateRange, events) {
  if (!dateRange.includes('-')) {
    // Date unique
    return [{ date: dateRange, event: events[0] }];
  }

  const [start, end] = dateRange.split('-');
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  const result = [];
  let currentEventIndex = 0;

  while (startDate <= endDate) {
    result.push({
      date: formatDate(startDate),
      event: events[currentEventIndex] || 'TBD',
    });
    startDate.setDate(startDate.getDate() + 1);
    currentEventIndex++;
  }

  return result;
}

// Parse "DD.MM.YY" => Date
function parseDate(dateString) {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(`20${year}`, month - 1, day);
}

// Format Date => "DD.MM.YY"
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

// Chargement des articles
fetch('articles.json')
  .then(response => response.json())
  .then(data => {
    const articleList = document.getElementById('articles');
    articleList.innerHTML = ''; // Réinitialisation avant ajout

    data.forEach(article => {
      const li = document.createElement('li');
      li.classList.add('article-item');
      li.innerHTML = `
        <a href="${article.link}" target="_blank" rel="noopener noreferrer">
          <img src="${article.image}" alt="${article.title}">
          <h3>${article.title}</h3>
        </a>
      `;
      articleList.appendChild(li);
    });
  })
  .catch(error => console.error('Erreur chargement articles:', error));