import path from 'path';
import fs from 'fs';

export function getRestaurantsData() {
    const filePath = path.join(process.cwd(), './app/api/data.json'); // Adjust path as needed
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonData);
    return data;
}