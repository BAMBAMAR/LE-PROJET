<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
      <head>
        <title>Sitemap XML — Plan du site officiel | ProjetBI.org</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/css">
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            padding: 2rem 1rem;
            line-height: 1.5;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          header {
            background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%);
            color: #ffffff;
            padding: 2.5rem 2rem;
            position: relative;
          }
          header h1 {
            font-size: 1.85rem;
            font-weight: 800;
            letter-spacing: -0.025em;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
          }
          header p {
            font-size: 0.95rem;
            color: #d1fae5;
            max-width: 800px;
          }
          .stats-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 1.5rem 2rem;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
          }
          .stat-card {
            background: #ffffff;
            padding: 1rem 1.25rem;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .stat-num {
            font-size: 1.75rem;
            font-weight: 800;
            color: #047857;
          }
          .stat-label {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            font-weight: 600;
          }
          .controls {
            padding: 1.25rem 2rem;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            border-bottom: 1px solid #e2e8f0;
          }
          .search-box {
            flex: 1;
            min-width: 250px;
            position: relative;
          }
          .search-box input {
            width: 100%;
            padding: 0.65rem 1rem;
            font-size: 0.9rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            outline: none;
            transition: all 0.2s;
          }
          .search-box input:focus {
            border-color: #059669;
            box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
          }
          .note {
            font-size: 0.85rem;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.875rem;
          }
          thead th {
            background: #f8fafc;
            padding: 0.875rem 1.25rem;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
            position: sticky;
            top: 0;
          }
          tbody tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background-color 0.15s;
          }
          tbody tr:hover {
            background-color: #f8fafc;
          }
          tbody td {
            padding: 0.875rem 1.25rem;
            color: #334155;
            vertical-align: middle;
          }
          td a {
            color: #047857;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
          }
          td a:hover {
            text-decoration: underline;
            color: #065f46;
          }
          .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            border-radius: 9999px;
            text-align: center;
          }
          .badge-high {
            background: #dcfce7;
            color: #15803d;
          }
          .badge-med {
            background: #e0f2fe;
            color: #0369a1;
          }
          .badge-std {
            background: #f1f5f9;
            color: #475569;
          }
          footer {
            padding: 1.5rem 2rem;
            text-align: center;
            font-size: 0.825rem;
            color: #64748b;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
          footer a {
            color: #047857;
            text-decoration: none;
            font-weight: 600;
          }
          footer a:hover {
            text-decoration: underline;
          }
        </style>
        <script type="text/javascript">
          function filterUrls() {
            var input = document.getElementById("search");
            var filter = input.value.toLowerCase();
            var rows = document.getElementById("url-table-body").getElementsByTagName("tr");
            var visibleCount = 0;
            for (var i = 0; i &lt; rows.length; i++) {
              var td = rows[i].getElementsByTagName("td")[0];
              if (td) {
                var txtValue = td.textContent || td.innerText;
                if (txtValue.toLowerCase().indexOf(filter) &gt; -1) {
                  rows[i].style.display = "";
                  visibleCount++;
                } else {
                  rows[i].style.display = "none";
                }
              }
            }
            document.getElementById("visible-count").innerText = visibleCount;
          }
        </script>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>
              <span>🇸🇳</span> Plan du Site XML (Sitemap)
            </h1>
            <p>
              Ce fichier d'indexation XML est conforme au protocole officiel <a href="https://www.sitemaps.org" target="_blank" style="color: #a7f3d0; text-decoration: underline;">sitemaps.org 0.9</a>. Il référence toutes les URLs canoniques de ProjetBI.org pour Googlebot, Bing et les moteurs de recherche.
            </p>
          </header>

          <div class="stats-bar">
            <div class="stat-card">
              <div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
              <div class="stat-label">Total URLs Indexables</div>
            </div>
            <div class="stat-card">
              <div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc, '/engagements/')])"/></div>
              <div class="stat-label">Fiches Engagements</div>
            </div>
            <div class="stat-card">
              <div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc, '/actualites/')])"/></div>
              <div class="stat-label">Articles Actualités</div>
            </div>
            <div class="stat-card">
              <div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[not(contains(sitemap:loc, '/engagements/')) and not(contains(sitemap:loc, '/actualites/'))])"/></div>
              <div class="stat-label">Pages Générales</div>
            </div>
          </div>

          <div class="controls">
            <div class="search-box">
              <input type="text" id="search" onkeyup="filterUrls()" placeholder="Rechercher une URL (ex: promise_4, actualites, 2026)..." />
            </div>
            <div class="note">
              Affichage de <strong id="visible-count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs sur <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 55%;">URL Canonique</th>
                <th style="width: 15%;">Priorité</th>
                <th style="width: 15%;">Fréquence</th>
                <th style="width: 15%;">Dernière Modification</th>
              </tr>
            </thead>
            <tbody id="url-table-body">
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <xsl:variable name="itemURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <a href="{$itemURL}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="sitemap:priority &gt;= 0.9">
                        <span class="badge badge-high"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority &gt;= 0.8">
                        <span class="badge badge-med"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="badge badge-std"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            <p>
              ProjetBI.org — Baromètre citoyen et indépendant de suivi des engagements de l'État du Sénégal.
              <br/>
              Retourner à l'accueil : <a href="https://www.projetbi.org/">https://www.projetbi.org/</a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
