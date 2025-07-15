import feedparser

def get_latest_articles():
    rss_url = "https://www.eurosport.com/rss.xml"
    feed = feedparser.parse(rss_url)
    
    articles = []
    for entry in feed.entries[:4]:  # Récupère les 4 derniers articles
        articles.append({
            "title": entry.title,
            "link": entry.link,
            "summary": entry.summary,
            "image": entry.media_content[0]['url'] if 'media_content' in entry else None
        })
    return articles