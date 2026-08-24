"""
collect_drafts.py — Collecte automatique des mises à jour pour ProjetBI

Sources :
  • Google News RSS   (presidence, primature, assemblee, PASTEF, Diomaye)
  • Présidence.sn     (scraping HTML)
  • Primature.sn      (scraping HTML)
  • Facebook          (Graph API — optionnel, nécessite FB_ACCESS_TOKEN)

Sortie : drafts.json à la racine du repo
"""

import json
import os
import re
import sys
import hashlib
from datetime import datetime, timedelta, timezone
from urllib.parse import urljoin, quote

try:
    import feedparser
except ImportError:
    os.system("pip install feedparser -q")
    import feedparser

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    os.system("pip install requests beautifulsoup4 -q")
    import requests
    from bs4 import BeautifulSoup

try:
    import anthropic
except ImportError:
    os.system("pip install anthropic -q")
    import anthropic

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
FB_ACCESS_TOKEN   = os.environ.get("FB_ACCESS_TOKEN", "")   # optionnel
FB_PAGE_ID        = "gouvernementsn"

DRAFTS_PATH   = "drafts.json"
PROMISES_PATH = "promises.json"
SOURCES_PATH  = "sources.json"
MAX_DRAFTS    = 200   # limite stockage
MAX_AGE_DAYS  = 3     # ignorer articles plus vieux

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; ProjetBI-Bot/1.0; +https://projetbi.org)"
}

GOOGLE_NEWS_BASE = (
    "https://news.google.com/rss/search?q={query}"
    "&hl=fr&gl=SN&ceid=SN:fr"
)

def load_sources() -> dict:
    """Charge sources.json. Retourne les sources par défaut si absent."""
    try:
        with open(SOURCES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        rss      = [s for s in data.get("rss", [])      if s.get("active", True)]
        websites = [s for s in data.get("websites", []) if s.get("active", True)]
        print(f"  sources.json charge : {len(rss)} RSS, {len(websites)} sites")
        return {"rss": rss, "websites": websites}
    except Exception:
        print("  sources.json absent — sources par defaut utilisees")
        return {"rss": [], "websites": []}


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def article_too_old(pub_date_str: str) -> bool:
    """Retourne True si l'article est plus vieux que MAX_AGE_DAYS."""
    if not pub_date_str:
        return False
    try:
        # feedparser dates
        import email.utils
        t = email.utils.parsedate_to_datetime(pub_date_str)
        return (now_utc() - t).days > MAX_AGE_DAYS
    except Exception:
        pass
    try:
        t = datetime.fromisoformat(pub_date_str.replace("Z", "+00:00"))
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        return (now_utc() - t).days > MAX_AGE_DAYS
    except Exception:
        return False


def dedup_key(url: str, title: str) -> str:
    raw = f"{url}|{title[:60]}".lower().strip()
    return hashlib.md5(raw.encode()).hexdigest()[:16]


def clean_html(text: str) -> str:
    """Supprime les balises HTML résiduelles."""
    return re.sub(r"<[^>]+>", "", text or "").strip()


def format_date_fr(dt: datetime) -> str:
    return dt.strftime("%d/%m/%Y")


def load_existing_drafts() -> dict:
    try:
        with open(DRAFTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"drafts": [], "last_updated": ""}


def load_promises() -> list:
    try:
        with open(PROMISES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("promises", [])
    except Exception:
        return []


# ─────────────────────────────────────────────
# COLLECTE — Google News RSS
# ─────────────────────────────────────────────
def fetch_google_news(rss_sources: list = None) -> list:
    articles = []
    feeds = rss_sources or []
    for src in feeds:
        url = src.get("url", "")
        if not url:
            continue
        name = src.get("name", url)
        try:
            feed = feedparser.parse(url, request_headers=HEADERS)
            for entry in feed.entries[:8]:
                pub = entry.get("published", "")
                if article_too_old(pub):
                    continue
                title   = clean_html(entry.get("title", ""))
                summary = clean_html(entry.get("summary", ""))[:600]
                link    = entry.get("link", "")
                source  = entry.get("source", {}).get("title", name)
                if title:
                    articles.append({
                        "title":   title,
                        "summary": summary,
                        "link":    link,
                        "source":  source,
                        "date":    pub,
                        "origin":  "rss",
                    })
        except Exception as e:
            print(f"  [RSS] Erreur pour '{name}': {e}")
    print(f"  RSS → {len(articles)} articles")
    return articles


# ─────────────────────────────────────────────
# COLLECTE — Scraping officiel
# ─────────────────────────────────────────────
def scrape_presidence(url: str, source_name: str) -> list:
    articles = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        # Liens dans la zone actualités (balises <a> avec /fr/actualites/ dans href)
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "/actualites/" in href or "/discours/" in href or "/communiques/" in href:
                full_url = urljoin("https://www.presidence.sn", href)
                title    = a.get_text(strip=True)
                if len(title) > 20:
                    articles.append({
                        "title":   title,
                        "summary": "",
                        "link":    full_url,
                        "source":  source_name,
                        "date":    "",
                        "origin":  "scraping",
                    })
    except Exception as e:
        print(f"  [Scraping {source_name}] Erreur: {e}")
    # Dédupliquer par URL
    seen = set()
    result = []
    for a in articles:
        if a["link"] not in seen:
            seen.add(a["link"])
            result.append(a)
    print(f"  {source_name} → {len(result)} articles")
    return result[:10]


def scrape_primature(url: str, source_name: str) -> list:
    articles = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        # h4 > a pattern
        for h4 in soup.find_all("h4"):
            a = h4.find("a", href=True)
            if a:
                title    = a.get_text(strip=True)
                href     = a["href"]
                full_url = urljoin("https://primature.sn", href)
                if len(title) > 15:
                    articles.append({
                        "title":   title,
                        "summary": "",
                        "link":    full_url,
                        "source":  source_name,
                        "date":    "",
                        "origin":  "scraping",
                    })
        # h3 > a pattern (fallback)
        if not articles:
            for h3 in soup.find_all("h3"):
                a = h3.find("a", href=True)
                if a:
                    title    = a.get_text(strip=True)
                    href     = a["href"]
                    full_url = urljoin("https://primature.sn", href)
                    if len(title) > 15:
                        articles.append({
                            "title":   title,
                            "summary": "",
                            "link":    full_url,
                            "source":  source_name,
                            "date":    "",
                            "origin":  "scraping",
                        })
    except Exception as e:
        print(f"  [Scraping {source_name}] Erreur: {e}")
    print(f"  {source_name} → {len(articles)} articles")
    return articles[:10]


def scrape_assemblee(url: str, source_name: str) -> list:
    articles = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if any(x in href for x in ["/actualites/", "/seances/", "/lois/", "/communiques/"]):
                full_url = urljoin("https://www.assemblee.sn", href)
                title    = a.get_text(strip=True)
                if len(title) > 20:
                    articles.append({
                        "title":   title,
                        "summary": "",
                        "link":    full_url,
                        "source":  source_name,
                        "date":    "",
                        "origin":  "scraping",
                    })
    except Exception as e:
        print(f"  [Scraping {source_name}] Erreur: {e}")
    seen, result = set(), []
    for a in articles:
        if a["link"] not in seen:
            seen.add(a["link"])
            result.append(a)
    print(f"  {source_name} → {len(result)} articles")
    return result[:10]


def scrape_official_pages(websites: list = None) -> list:
    all_articles = []
    pages = websites or []
    for page in pages:
        t = page.get("type", "generic")
        u = page.get("url", "")
        n = page.get("name", u)
        if not u:
            continue
        if t == "presidence":
            all_articles += scrape_presidence(u, n)
        elif t == "primature":
            all_articles += scrape_primature(u, n)
        elif t == "assemblee":
            all_articles += scrape_assemblee(u, n)
        else:
            # Type générique : extrait tous les liens avec un texte suffisant
            all_articles += scrape_generic(u, n)
    return all_articles


def scrape_generic(url: str, source_name: str) -> list:
    """Scraping générique : récupère tous les liens textuels d'une page."""
    articles = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        for a in soup.find_all("a", href=True):
            href  = a["href"]
            title = a.get_text(strip=True)
            if len(title) < 20:
                continue
            full_url = urljoin(url, href)
            # Ignorer les liens de navigation / footer
            if any(x in href for x in ["#", "javascript:", "mailto:", "tel:"]):
                continue
            articles.append({
                "title":   title,
                "summary": "",
                "link":    full_url,
                "source":  source_name,
                "date":    "",
                "origin":  "scraping",
            })
        # Dédupliquer
        seen, result = set(), []
        for a in articles:
            if a["link"] not in seen:
                seen.add(a["link"])
                result.append(a)
        print(f"  {source_name} (générique) → {len(result[:10])} articles")
        return result[:10]
    except Exception as e:
        print(f"  [Scraping générique {source_name}] Erreur: {e}")
        return []


# ─────────────────────────────────────────────
# COLLECTE — Facebook Graph API (optionnel)
# ─────────────────────────────────────────────
def fetch_facebook_posts() -> list:
    if not FB_ACCESS_TOKEN:
        print("  Facebook → skipped (FB_ACCESS_TOKEN non configuré)")
        return []
    url = (
        f"https://graph.facebook.com/v19.0/{FB_PAGE_ID}/posts"
        f"?fields=message,story,permalink_url,created_time"
        f"&limit=10&access_token={FB_ACCESS_TOKEN}"
    )
    try:
        resp  = requests.get(url, timeout=10)
        data  = resp.json()
        posts = data.get("data", [])
        articles = []
        for p in posts:
            msg  = p.get("message") or p.get("story", "")
            link = p.get("permalink_url", "")
            date = p.get("created_time", "")
            if msg and len(msg) > 30:
                if article_too_old(date):
                    continue
                articles.append({
                    "title":   msg[:120],
                    "summary": msg[:500],
                    "link":    link,
                    "source":  "Facebook — Gouvernement SN",
                    "date":    date,
                    "origin":  "facebook",
                })
        print(f"  Facebook → {len(articles)} posts")
        return articles
    except Exception as e:
        print(f"  [Facebook] Erreur: {e}")
        return []


# ─────────────────────────────────────────────
# ANALYSE — Claude API
# ─────────────────────────────────────────────
def analyse_sans_claude(articles: list) -> list:
    """Fallback : convertit les articles bruts en brouillons sans appel API."""
    drafts = []
    today  = datetime.now().strftime("%Y-%m-%d")
    for a in articles[:30]:
        title = a.get("title", "").strip()
        if not title or len(title) < 15:
            continue
        drafts.append({
            "type":        "news",
            "promise_id":  None,
            "title":       title,
            "description": a.get("summary", title)[:400] or title,
            "source":      a.get("source", ""),
            "source_url":  a.get("link", ""),
            "date":        today,
            "domain":      "Politique",
            "confidence":  0.60,
            "keywords":    [],
        })
    print(f"  Fallback (sans Claude) → {len(drafts)} brouillons")
    return drafts


def analyse_with_claude(articles: list, promises: list) -> list:
    if not ANTHROPIC_API_KEY:
        print("  Claude API → skipped (ANTHROPIC_API_KEY non configure)")
        print("  Utilisation du mode fallback sans analyse IA...")
        return analyse_sans_claude(articles)
    if not articles:
        return []

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # Résumé compact des promesses (max 60 pour le contexte)
    promises_compact = [
        {"id": p.get("id"), "engagement": p.get("engagement", "")[:120], "domaine": p.get("domaine", "")}
        for p in promises[:60]
    ]

    # Dédupliquer et limiter les articles
    seen_titles, unique_articles = set(), []
    for a in articles:
        key = a["title"][:80].lower()
        if key not in seen_titles:
            seen_titles.add(key)
            unique_articles.append(a)
    articles_to_send = unique_articles[:40]

    today_str = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""Tu es un assistant de suivi politique sénégalais pour ProjetBI.

Date du jour : {today_str}

PROMESSES SUIVIES (extrait) :
{json.dumps(promises_compact, ensure_ascii=False, indent=2)}

ARTICLES COLLECTÉS :
{json.dumps(articles_to_send, ensure_ascii=False, indent=2)}

TÂCHE :
Pour chaque article pertinent (lié à une promesse présidentielle ou à une action gouvernementale notable), génère un brouillon structuré.

RÈGLES :
- Ne génère un brouillon QUE si l'article est clairement lié au suivi des promesses ou à une action gouvernementale concrète
- Ignore les articles purement politiques sans lien avec les engagements
- Si l'article est lié à une promesse spécifique, fournis le promise_id correspondant
- Si c'est une actualité générale (non liée à une promesse précise), utilise promise_id = null et type = "news"
- confidence : 0.0 à 1.0 selon la certitude du lien avec une promesse (ou 0.7 pour une actualité gouvernementale pertinente)
- Ne génère que les brouillons avec confidence >= 0.60
- description : 2-3 phrases factuelles, sans jugement politique

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après :
{{
  "drafts": [
    {{
      "type": "promise_update" | "news",
      "promise_id": "id_de_la_promesse_ou_null",
      "title": "titre court et factuel",
      "description": "résumé factuel en 2-3 phrases",
      "source": "nom de la source",
      "source_url": "url de l'article",
      "date": "YYYY-MM-DD",
      "domain": "domaine thématique",
      "confidence": 0.85,
      "keywords": ["mot1", "mot2"]
    }}
  ]
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        # Extraire le JSON si encapsulé dans ```
        m = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", raw)
        if m:
            raw = m.group(1)
        result = json.loads(raw)
        drafts = result.get("drafts", [])
        print(f"  Claude → {len(drafts)} brouillons générés")
        return drafts
    except json.JSONDecodeError as e:
        print(f"  [Claude] JSON invalide : {e}")
        print("  Bascule vers le mode fallback...")
        return analyse_sans_claude(articles)
    except Exception as e:
        print(f"  [Claude] Erreur : {e}")
        print("  Bascule vers le mode fallback...")
        return analyse_sans_claude(articles)


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    print(f"\n{'='*55}")
    print(f"  ProjetBI — Collecte automatique  {now_utc().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*55}")

    promises = load_promises()
    print(f"  Promesses chargees : {len(promises)}")

    sources  = load_sources()
    existing = load_existing_drafts()
    existing_keys = {d.get("_dedup_key") for d in existing.get("drafts", [])}

    # ── Collecte ──
    print("\n[1/3] Collecte des sources…")
    articles  = fetch_google_news(sources["rss"])
    articles += scrape_official_pages(sources["websites"])
    articles += fetch_facebook_posts()
    print(f"  Total brut : {len(articles)} articles")

    # ── Analyse ──
    print("\n[2/3] Analyse avec Claude…")
    new_drafts = analyse_with_claude(articles, promises)

    # ── Intégration ──
    print("\n[3/3] Intégration des brouillons…")
    added = 0
    ts    = now_utc().strftime("%Y%m%d%H%M%S")
    for i, d in enumerate(new_drafts):
        key = dedup_key(d.get("source_url", ""), d.get("title", ""))
        if key in existing_keys:
            continue
        d["id"]         = f"draft_{ts}_{i}"
        d["_dedup_key"] = key
        d["status"]     = "pending"
        d["created_at"] = now_utc().isoformat()
        existing["drafts"].insert(0, d)
        existing_keys.add(key)
        added += 1

    # Purger les drafts validés/rejetés de plus de 30 jours
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    existing["drafts"] = [
        d for d in existing["drafts"]
        if d.get("status") == "pending" or d.get("created_at", "") > cutoff
    ]

    # Garder les plus récents
    existing["drafts"] = existing["drafts"][:MAX_DRAFTS]
    existing["last_updated"] = now_utc().isoformat()

    with open(DRAFTS_PATH, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f"\n  ✅ {added} nouveau(x) brouillon(s) ajouté(s)")
    print(f"  Total en attente : {sum(1 for d in existing['drafts'] if d.get('status') == 'pending')}")
    print(f"  Fichier : {DRAFTS_PATH}\n")


if __name__ == "__main__":
    main()
