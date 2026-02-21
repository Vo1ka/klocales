import type { GeoCode, UrlGroup } from "../types";
import * as XLSX from 'xlsx';

export class GeoParser {
  static parseGeoCodes(input: string): GeoCode[] {
    // Убираем лишние пробелы и разделяем по 'x'
    const parts = input
      .split(/\s*x\s*/i)
      .map(part => part.trim())
      .filter(part => part.length > 0);

    const geoCodes: GeoCode[] = [];

    parts.forEach(part => {
      // Паттерн: буква-двухбуквенный_код (и от 2 до 5 букв)
      const match = part.match(/^([A-Z])-([A-Z]{2,5})$/i);
      
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
      } else {
        // Логируем неподдерживаемые форматы для отладки
        console.warn(`Неподдерживаемый формат гео-кода: "${part}"`);
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

  /**
   * Экспорт данных в Excel (.xlsx)
   */
  static exportToExcel(data: UrlGroup | UrlGroup[]): void {
    const groups = Array.isArray(data) ? data : [data];
    if (groups.length === 0) return;

    const workbook = XLSX.utils.book_new();

    // Создаем отдельный лист (worksheet) для КАЖДОГО URL
    groups.forEach((group, index) => {
      const rows = group.geoCodes.map(geo => ({
        'ГЕО-КОД': geo.code,
        'СТАТУС': geo.checked ? '✅ Выполнено' : '❌ Не выполнено',
        'ЗАМЕТКА': geo.note || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      
      // Настраиваем ширину колонок
      worksheet['!cols'] = [
        { wch: 15 }, // ГЕО-КОД
        { wch: 20 }, // СТАТУС
        { wch: 50 }  // ЗАМЕТКА
      ];

      // Имя листа в Excel (макс 31 символ, без спецсимволов \ / ? * [ ])
      let sheetName = group.url.replace(/[\\\/\?\*\[\]:]/g, '_').substring(0, 31);
      if (!sheetName) sheetName = `Страница ${index + 1}`;

      // Фикс дубликатов имен листов (если URL обрезался одинаково)
      const existingNames = workbook.SheetNames;
      if (existingNames.includes(sheetName)) {
         sheetName = `${sheetName.substring(0, 27)}_${index}`;
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Формируем имя файла
    const date = new Date().toISOString().split('T')[0];
    let fileName = `geo-export-all-${date}.xlsx`;

    // Если экспортируем только одну карточку, называем файл её именем
    if (!Array.isArray(data)) {
       const safeUrl = data.url.replace(/[^a-z0-9]/gi, '_').substring(0, 20).toLowerCase();
       fileName = `geo-${safeUrl}-${date}.xlsx`;
    }

    XLSX.writeFile(workbook, fileName);
  }

}
