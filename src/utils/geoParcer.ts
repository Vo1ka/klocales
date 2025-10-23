import type { GeoCode, UrlGroup } from "../types";

export class GeoParser {
  static parseGeoCodes(input: string): GeoCode[] {
    // Убираем лишние пробелы и разделяем по 'x'
    const parts = input
      .split(/\s*x\s*/i)
      .map(part => part.trim())
      .filter(part => part.length > 0);

    const geoCodes: GeoCode[] = [];

    parts.forEach(part => {
      // Паттерн: буква-двухбуквенный_код
      const match = part.match(/^([A-Z])-([A-Z]{2})$/i);
      
      if (match) {
        const prefix = match[1].toUpperCase();
        const country = match[2].toUpperCase();
        
        geoCodes.push({
          prefix,
          country,
          code: `${prefix}-${country}`,
          checked: false, 
          note: ''
        });
      }
    });
    return geoCodes.sort((a, b) => a.country.localeCompare(b.country));
  }

  static parseUrls(input: string): string[] {
    // Разделители: перенос строки, запятая, точка с запятой, пробел
    const urls = input
      .split(/[\n,;\s]+/)
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .map(url => {
        // Убираем протокол если есть
        url = url.replace(/^https?:\/\//, '');
        // Убираем trailing slash
        url = url.replace(/\/$/, '');
        return url;
      })
      .filter(url => url.length > 0);

    // Убираем дубликаты
    return [...new Set(urls)];
  }

  /**
   * Создаёт группы URL с гео-кодами
   */
  static createUrlGroups(urls: string[], geoCodes: GeoCode[]): UrlGroup[] {
    return urls.map(url => ({
      id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      // Создаём копию локалей для каждого URL
      geoCodes: geoCodes.map(geo => ({ ...geo }))
    }));
  }

  /**
   * Полный парсинг: гео-коды + URLs
   */
  static parse(geoInput: string, urlInput: string): UrlGroup[] {
    const geoCodes = this.parseGeoCodes(geoInput);
    const urls = this.parseUrls(urlInput);
    
    if (geoCodes.length === 0 || urls.length === 0) {
      return [];
    }

    return this.createUrlGroups(urls, geoCodes);
  }

  /**
   * Экспорт данных в различные форматы
   */
  static exportToJSON(urlGroups: UrlGroup[]): string {
    return JSON.stringify(urlGroups, null, 2);
  }

  static exportToCSV(urlGroups: UrlGroup[]): string {
    const rows: string[] = ['URL,Geo Code,Checked,Note'];
    
    urlGroups.forEach(group => {
      group.geoCodes.forEach(geo => {
        const checked = geo.checked ? 'Yes' : 'No';
        const note = geo.note.replace(/,/g, ';'); // Экранируем запятые
        rows.push(`${group.url},${geo.code},${checked},"${note}"`);
      });
    });

    return rows.join('\n');
  }

  static exportToMarkdown(urlGroups: UrlGroup[]): string {
    let md = '# Geo Codes Report\n\n';
    
    urlGroups.forEach(group => {
      md += `## ${group.url}\n\n`;
      md += '| Geo Code | Status | Note |\n';
      md += '|----------|--------|------|\n';
      
      group.geoCodes.forEach(geo => {
        const status = geo.checked ? '✅' : '❌';
        const note = geo.note || '-';
        md += `| ${geo.code} | ${status} | ${note} |\n`;
      });
      
      md += '\n';
    });

    return md;
  }
}
