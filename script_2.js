let currentPage = 1;
const skiersPerPage = 18;
let skiersData = [];
let filteredSkiers = [];
let selectedSkiers = [];
const maxSelections = 8;
const maxPerNationality = 2;
let totalBudget = 80; // The maximum budget for the skiers
let remainingBudget = totalBudget; // The remaining budget that will update dynamically
const budgetElement = document.getElementById("remaining-budget"); // This is where the remaining budget will be displayed
const totalBudgetElement = document.getElementById("total-budget"); // This is where the total budget will be displayed

// Charger les données des skieurs et initialiser l'application
async function loadSkiers() {
    try {
        const response = await fetch("output.json");
        if (!response.ok) throw new Error("Erreur lors du chargement des skieurs.");
        skiersData = await response.json();
        populateNationalityFilter();
        loadPage(currentPage);
        loadSavedTeam(); // Charger l'équipe sauvegardée si elle existe
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }
}


// Remplir les options de nationalité dans le filtre
function populateNationalityFilter() {
    const nationalities = [...new Set(skiersData.map(skier => skier.nationality))];
    const filter = document.getElementById("nationality-filter");
    filter.innerHTML = '<option value="">-- Filtrer par nationalité --</option>';
    nationalities.forEach(nationality => {
        const option = document.createElement("option");
        option.value = nationality;
        option.textContent = nationality;
        filter.appendChild(option);
    });
}

function loadSavedTeam() {
    const currentUser = localStorage.getItem("currentUser"); // Identifier l'utilisateur connecté
    if (!currentUser) {
        alert("Veuillez vous connecter pour charger votre équipe.");
        return;
    }

    const userKey = `selectedTeam_${currentUser}`;
    const savedTeam = JSON.parse(localStorage.getItem(userKey));
    if (savedTeam) {
        selectedSkiers = savedTeam.map(skier => ({
            ...skier,
            Price: parseFloat(skier.Price) || 0
        }));
        remainingBudget = totalBudget - selectedSkiers.reduce((total, skier) => total + skier.Price, 0);
        remainingBudget = Math.max(remainingBudget, 0);
        updateRemainingBudget();
        updateSelectedBoxes();
    }
}

function loadPage(page) {
    const skierInfoContainer = document.getElementById("skier-info");
    skierInfoContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();
    const skiersToShow = filteredSkiers.length ? filteredSkiers : skiersData;
    const startIndex = (page - 1) * skiersPerPage;
    const pageData = skiersToShow.slice(startIndex, startIndex + skiersPerPage);

    pageData.forEach(skier => {
        const card = document.createElement("div");
        card.className = "skier-card";
        const flagPath = `flags/${skier.nationality.toLowerCase()}.png`;
        card.innerHTML = `
            <div class="skier-card-content">
                <div class="skier-info">
                    <img src="${flagPath}" alt="${skier.nationality} flag">
                    <h4>${skier.firstName} ${skier.lastName}</h4>
                    <p>Age: ${skier.age}</p>
                    <p>Disciplines: ${skier.disciplines.join(", ")}</p>
                    <a href="${skier.lien}" target="_blank" class="see-more-link" onclick="event.stopPropagation()">Voir plus</a>
                </div>
                <div class="skier-price">
                    <span>${skier.Price}</span>
                </div>
            </div>
        `;
        card.onclick = () => selectSkier(skier);
        fragment.appendChild(card);
    });

    skierInfoContainer.appendChild(fragment);
    updatePaginationButtons();
}

// Sélectionner ou désélectionner un skieur
// Function to select or deselect a skier
function selectSkier(skier) {
    const skierIndex = selectedSkiers.findIndex(
        s => s.firstName === skier.firstName && s.lastName === skier.lastName
    );

    if (skierIndex !== -1) {
        deselectSkier(skierIndex); // Utilisez la fonction centralisée
    } else if (selectedSkiers.length < maxSelections) {
        // If the skier is not selected and there is space for more selections
        const skierCountByNationality = selectedSkiers.filter(
            s => s.nationality === skier.nationality
        ).length;

        if (skierCountByNationality >= maxPerNationality) {
            alert(`Vous avez atteint la limite de skieurs pour la nationalité ${skier.nationality}.`);
            return;
        }

        // Check if there is enough budget to select this skier
        const skierPrice = parseFloat(skier.Price);
        if (remainingBudget >= skierPrice) {
            selectedSkiers.push(skier); // Add skier to the selection
            remainingBudget -= skierPrice; // Deduct the skier's price from the remaining budget
        } else {
            alert("Vous n'avez pas assez de budget pour sélectionner ce skieur."); // Alert if budget is insufficient
            return;
        }
    } else {
        alert("Vous avez atteint le nombre maximum de sélections !");
        return;
    }
    updateSelectedBoxes();
    updateRemainingBudget();
}

function updateRemainingBudget() {
    budgetElement.innerText = `Budget restant : ${remainingBudget}`;
}

function updateSelectedBoxes() {
    const boxes = document.querySelectorAll(".box");

    boxes.forEach((box, index) => {
        if (selectedSkiers[index]) {
            const skier = selectedSkiers[index];
            const flagPath = `flags/${skier.nationality.toLowerCase()}.png`;

            box.classList.add("selected");
            box.innerHTML = `
                <img src="${flagPath}" alt="Flag">
                <p>${skier.firstName} ${skier.lastName}</p>
            `;
            box.onclick = () => deselectSkier(index);
            // Ajout de l'événement pour désélectionner un skieur
            
        } else {
            box.classList.remove("selected");
            box.innerHTML = `<img src="icons/person.png" alt="person icon"><p>Sélectionner un skieur</p>`;
            box.onclick = () => openSkierList(box);
        }
    });
}


function resetSelection() {
    selectedSkiers = []; // Clear the selected skiers array
    remainingBudget = totalBudget; // Reset the remaining budget
    document.querySelectorAll('.skier-card').forEach(card => {
        card.querySelector('.select-button').disabled = false; // Enable all select buttons again
        card.classList.remove('selected'); // Remove the selected class from all skier cards
    });
    updateRemainingBudget(); // Update the remaining budget display
}

// Add event listeners to all select buttons
document.querySelectorAll('.select-button').forEach(button => {
    button.addEventListener('click', handleSkierSelection);
});

// Afficher les boutons de pagination correctement
function updatePaginationButtons() {
    const totalPages = Math.ceil((filteredSkiers.length || skiersData.length) / skiersPerPage);
    document.getElementById("current-page").textContent = `Page ${currentPage}`;
    document.getElementById("prev-page").disabled = currentPage === 1;
    document.getElementById("next-page").disabled = currentPage === totalPages;
}

// Passer à la page suivante
function nextPage() {
    const totalPages = Math.ceil((filteredSkiers.length || skiersData.length) / skiersPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadPage(currentPage);
    }
}

// Revenir à la page précédente
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPage(currentPage);
    }
}

// Appliquer les filtres sur les skieurs
function applyFilters() {
    const searchQuery = document.getElementById("search-bar").value.toLowerCase();
    const selectedDiscipline = document.getElementById("discipline-filter").value;
    const selectedNationality = document.getElementById("nationality-filter").value;
    const ageFilter = document.getElementById("age-filter").value;
    
    // Get the values for the price range filter
    const minPrice = parseFloat(document.getElementById("price-filter-min").value) || 5;
    const maxPrice = parseFloat(document.getElementById("price-filter-max").value) || 20;

    filteredSkiers = skiersData.filter(skier => {
        const matchesSearch = `${skier.firstName} ${skier.lastName}`.toLowerCase().includes(searchQuery);
        const matchesDiscipline = selectedDiscipline ? skier.disciplines.includes(selectedDiscipline) : true;
        const matchesNationality = selectedNationality ? skier.nationality === selectedNationality : true;
        const matchesAge = ageFilter ? skier.age === parseInt(ageFilter) : true;
        
        // Check if the skier's price is within the selected price range
        const skierPrice = parseFloat(skier.Price);
        const matchesPrice = skierPrice >= minPrice && skierPrice <= maxPrice;

        return matchesSearch && matchesDiscipline && matchesNationality && matchesAge && matchesPrice;
    });

    currentPage = 1;
    loadPage(currentPage);
}

function deselectSkier(skierIndex) {
    const skier = selectedSkiers[skierIndex];
    if (!skier) return; // Si aucun skieur à cet index, ne rien faire

    remainingBudget += parseFloat(skier.Price) || 0 // Rendre les étoiles
    selectedSkiers.splice(skierIndex, 1); // Retirer le skieur de la liste
    updateRemainingBudget(); // Mettre à jour l'affichage du budget restant
    updateSelectedBoxes(); // Mettre à jour les boîtes sélectionnées
}

// Rechercher des skieurs
function searchSkiers() {
    applyFilters();
}

function saveTeam() {
    const currentUser = localStorage.getItem("currentUser"); // Identifier l'utilisateur connecté
    if (!currentUser) {
        alert("Vous devez être connecté pour sauvegarder votre équipe.");
        return;
    }

    const userKey = `selectedTeam_${currentUser}`;
    localStorage.setItem(userKey, JSON.stringify(selectedSkiers)); // Associer l'équipe à l'utilisateur
    alert("Votre équipe a été sauvegardée !");
}

// Ouvrir la liste des skieurs
function openSkierList(box) {
    if (!box.classList.contains("selected")) {
        document.getElementById("filters").classList.remove("hidden");
        document.getElementById("skier-list").classList.remove("hidden");
    }
}

// Initialiser l'application
document.addEventListener("DOMContentLoaded", loadSkiers);
document.getElementById("save-button").addEventListener("click", saveTeam); // Écouter l'événement de sauvegarde

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

function updateUIAfterLogin() {
    const user = localStorage.getItem("currentUser");
    if (user) {
      // Masquer le bouton de connexion et afficher le bouton de déconnexion
      document.getElementById("loginBtn").style.display = "none";
      document.getElementById("logoutBtn").style.display = "block";
    }
  }
  
  // Gestion de la soumission du formulaire de connexion
  document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();  // Empêche le formulaire de recharger la page
    
    // Récupère les informations de connexion
    const username = document.getElementById("username").value;
    
    // Enregistrer l'utilisateur dans le localStorage
    localStorage.setItem("currentUser", username);
    
    // Met à jour l'interface pour refléter l'état connecté
    updateUIAfterLogin();
  });
  
  // Vérifier si l'utilisateur est déjà connecté lors du chargement de la page
  window.addEventListener('DOMContentLoaded', (event) => {
    updateUIAfterLogin();
  });