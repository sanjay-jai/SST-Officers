import Papa from 'papaparse';
import { Officer } from '../types';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1L4-x6tOdH_JA29I3kWzRNaJRkJC6IBCZ/export?format=csv&gid=1960410608';

export async function fetchOfficerData(): Promise<Officer[]> {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as string[][];
          const officers: Officer[] = [];
          let currentTaluk = '';

          // The sheet structure might have headers in the first few rows
          // We look for rows that have data in columns 1, 2, or 3
          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 2) continue;

            const talukVal = row[0]?.trim();
            const name = row[1]?.trim() || '';
            const designation = row[2]?.trim() || '';
            const mobile = row[3]?.trim() || '';

            // Skip header rows or empty rows that don't look like officer data
            if (name.toLowerCase() === 'name of officer' || name.toLowerCase() === 'name' || name === '') {
              // But check if this row has a Taluk value to update currentTaluk
              if (talukVal && (talukVal.includes('-') || talukVal.match(/^\d+/))) {
                currentTaluk = talukVal;
              }
              continue;
            }

            // Fill down logic for Taluk
            if (talukVal && (talukVal.includes('-') || talukVal.match(/^\d+/))) {
              currentTaluk = talukVal;
            }

            // Only add if we have a name and it's not a header
            if (name && name.length > 2 && currentTaluk) {
              officers.push({
                taluk: currentTaluk,
                name,
                designation,
                mobile,
              });
            }
          }
          resolve(officers);
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error fetching officer data:', error);
    throw error;
  }
}
