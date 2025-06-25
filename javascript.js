let latestArticleDate = null; // Stocke la date du dernier article affiché

async function fetchArticles() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/get-latest-articles'); // Endpoint backend
        const articles = await response.json();

        const articlesList = document.querySelector('.articles-list');
        
        // Vérifier si un nouvel article est disponible
        if (articles.length > 0 && new Date(articles[0].pubDate) > new Date(latestArticleDate || 0)) {
            latestArticleDate = articles[0].pubDate; // Mettre à jour la dernière date

            // Ajouter les nouveaux articles
            articlesList.innerHTML = ''; // Efface la liste actuelle
            articles.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.className = 'article';
                articleDiv.innerHTML = `
                    <a href="${article.link}" target="_blank">
                        <img src="${article.image}" alt="${article.title}">
                    </a>
                    <h4>${article.title}</h4>
                    <p>${article.summary}</p>
                    <a href="${article.link}" target="_blank" class="read-more">Lire plus</a>
                `;
                articlesList.appendChild(articleDiv);
            });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des articles :", error);
    }
}

// Charger les articles au démarrage
document.addEventListener('DOMContentLoaded', async () => {
    await fetchArticles();

    // Mettre à jour toutes les 5 minutes (300 000 ms)
    setInterval(fetchArticles, 300000);
});