import { public_fetch } from "@/lib/net/public_fetch";
import { parseHTML } from "cheerio";

interface HeraldArticle {
  title: string;
  link: string;
  content: string;
  published: Date;
  source: "Herald-Citizen";
  category: "political_news" | "election_coverage" | "government_meetings" | "court_cases" | "civic_events";
}

export async function scrapeHeraldCitizen(politicsPath: string = "/Politics") {
  try {
    const response = await public_fetch(`https://www.heraldcitizen.com${politicsPath}`, {
      headers: { "User-Agent": "AkashicBot/1.0" }
    });
    
    const html = await response.text();
    const dom = parseHTML(html);
    
    const politicsSection = dom.find('.section-politics, .politics, article');
    const articles: HeraldArticle[] = [];
    
    politicsSection.slice(0, 50).each((index, element) => {
      const title = dom(element).find('h1, h2, h3, h4, .title, .headline').first().text();
      const link = dom(element).find('a').first().attr('href');
      const content = dom(element).find('.article-content, .entry-content, .post-content').html() || '';
      const dateText = dom(element).find('.date, .published, time').first().attr('datetime') || new Date().toISOString();
      const category = determineCategory(title, content);
      
      if (title && link) {
        articles.push({
          title: title.trim(),
          link: link.startsWith('http') ? link : `https://www.heraldcitizen.com${link}`,
          content,
          published: new Date(dateText),
          source: "Herald-Citizen",
          category
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error("Herald-Citizen scraping failed:", error);
    return [];
  }
}

export async function getHeraldCitizenRSS(query: string = "Putnam County politics OR Cookeville government") {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);
    
    return feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet,
      pubDate: item.pubDate,
      source: "Herald-Citizen"
    }));
  } catch (error) {
    console.error("Herald-Citizen RSS parsing failed:", error);
    return [];
  }
}

function determineCategory(title: string, content: string): HeraldArticle["category"] {
  const text = (title + " " + content).toLowerCase();
  
  if (text.includes('election') || text.includes('candidate') || text.includes('ballot') || text.includes('vote')) {
    return "election_coverage";
  }
  if (text.includes('court') || text.includes('legal') || text.includes('case') || text.includes('judge')) {
    return "court_cases";
  }
  if (text.includes('government') || text.includes('mayor') || text.includes('council') || text.includes('meeting')) {
    return "government_meetings";
  }
  if (text.includes('civic') || text.includes('community') || text.includes('event') || text.includes('project')) {
    return "civic_events";
  }
  return "political_news";
}

export async function ingestHeraldCitizenData() {
  const politicsArticles = await scrapeHeraldCitizen();
  const rssArticles = await getHeraldCitizenRSS();
  
  return {
    politics: politicsArticles,
    rss: rssArticles,
    timestamp: new Date().toISOString()
  };
}