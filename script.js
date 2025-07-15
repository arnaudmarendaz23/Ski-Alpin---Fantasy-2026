fetch('courses.json')
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector('#courses-table tbody');
    const events = data["Calendar Event"];

    events.forEach(course => {
      // Ligne principale pour chaque course
      const row = document.createElement('tr');
      const dates = expandDateRange(course.Date, course.Event.split(','));

      row.innerHTML = `
        <td>${course.Date}</td>
        <td>${course.Country}</td>
        <td>${course.Place}</td>
        <td>${course.Event}</td>
      `;

      tableBody.appendChild(row);

      // Ajouter les détails pour les plages de dates
      if (dates.length > 1) {
        const detailsRow = document.createElement('tr');
        const detailsCell = document.createElement('td');

        detailsCell.colSpan = 4; // Fusionne les colonnes
        detailsCell.innerHTML = `
          <div class="details">
            ${dates.map(d => `<div>${d.date} - ${d.event}</div>`).join('')}
          </div>
        `;

        detailsRow.appendChild(detailsCell);
        detailsRow.classList.add('details-row');
        detailsRow.style.display = 'none'; // Cacher par défaut
        tableBody.appendChild(detailsRow);

        // Ajout de la fonctionnalité d'affichage/masquage
        row.addEventListener('click', () => {
          const isVisible = detailsRow.style.display === 'table-row';
          detailsRow.style.display = isVisible ? 'none' : 'table-row';
        });
      }
    });
  })
  .catch(error => console.error('Error loading data:', error));

// Fonction pour créer des dates individuelles
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
      event: events[currentEventIndex] || 'TBD', // Si pas assez d'événements
    });
    startDate.setDate(startDate.getDate() + 1);
    currentEventIndex++;
  }

  return result;
}

// Utilitaire : Convertit une date "DD.MM.YY" en objet Date
function parseDate(dateString) {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(`20${year}`, month - 1, day);
}

// Utilitaire : Convertit un objet Date en "DD.MM.YY"
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

fetch('articles.json')
    .then(response => response.json())
    .then(data => {
        const articleList = document.getElementById('articles'); // Changer de 'article-list' à 'articles'
        data.forEach(article => {
            const li = document.createElement('li');
            li.classList.add('article-item');
            li.innerHTML = `
                <a href="${article.link}" target="_blank">
                    <img src="${article.image}" alt="${article.title}">
                    <h3>${article.title}</h3>
                </a>
            `;
            articleList.appendChild(li);
        });
    })
    .catch(error => {
        console.error('Erreur lors du chargement des articles:', error);
    });



// Sélection des éléments
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.querySelectorAll('.close');
const registerLink = document.getElementById('registerLink');
const topnav = document.querySelector('.topnav');
const currentUser = localStorage.getItem('currentUser');

// Ouvrir la popup de connexion
loginBtn.addEventListener('click', (event) => {
    event.preventDefault();
    loginModal.style.display = 'block';
});

// Ouvrir la popup d'inscription
registerLink.addEventListener('click', (event) => {
    event.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
});

// Fermer les popups
closeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

// Fermer en cliquant à l'extérieur
window.addEventListener('click', (event) => {
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === registerModal) registerModal.style.display = 'none';
});


// Soumission du formulaire d'inscription
document.getElementById('registerForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const regUsername = document.getElementById('regUsername').value.trim();
    const regPassword = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('registerError');

    errorElement.style.display = 'none';
    errorElement.textContent = '';

    if (userExists(regUsername)) {
        errorElement.style.display = 'block';
        errorElement.textContent = 'This username is already taken. Choose another one.';
        return;
    }

    if (regPassword !== confirmPassword) {
        errorElement.style.display = 'block';
        errorElement.textContent = 'Passwords are different.';
        return;
    }

    saveUser(regUsername, regPassword);
    registerModal.style.display = 'none';
    alert('Account created successfully. Please log in.');
});

// Récupère ou initialise les utilisateurs dans localStorage
let registeredUsers = JSON.parse(localStorage.getItem('users')) || [];

// Fonction pour sauvegarder un nouvel utilisateur
function saveUser(username, password) {
    registeredUsers.push({ username, password });
    localStorage.setItem('users', JSON.stringify(registeredUsers));
}

// Vérifie si un utilisateur existe déjà
function userExists(username) {
    return registeredUsers.some(user => user.username === username);
}

// Modifier la logique de connexion pour afficher/masquer les boutons
document.getElementById('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!userExists(username)) {
      alert('Account does not exist. Please register.');
      return;
  }

  const user = registeredUsers.find(user => user.username === username);

  if (user.password !== password) {
      alert('Incorrect password.');
      return;
  }

  localStorage.setItem('currentUser', username); // Sauvegarde de l'utilisateur connecté

  loginModal.style.display = 'none'; // Ferme la popup de connexion
  loginBtn.style.display = 'none'; // Cache le bouton de connexion
  logoutBtn.style.display = 'block'; // Affiche le bouton de déconnexion
});

window.addEventListener('userLoggedIn', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
      console.log('Utilisateur connecté:', currentUser);
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';

      // Mettre à jour dynamiquement les données de la page après connexion
      afficherEquipesSauvegardees(currentUser);
  }
});

function afficherEquipesSauvegardees(user) {
  // Exemple de fonction pour charger les équipes liées à l'utilisateur
  const equipes = JSON.parse(localStorage.getItem(`equipes_${user}`)) || [];
  const equipeContainer = document.getElementById('equipeContainer');

  equipeContainer.innerHTML = ''; // Efface les anciennes données
  equipes.forEach(equipe => {
      const div = document.createElement('div');
      div.textContent = `Équipe : ${equipe.nom}`;
      equipeContainer.appendChild(div);
  });
}