import {promises as fs} from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(__dirname, 'data.json');

// Helper to load data from file
const loadData = async (): Promise<Record<string, any>> => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or is empty, return empty object
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            return {};
        }
        throw err;
    }
};

// Helper to save data to file
export const saveData = async (data: Record<string, any>) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

export const setData = async (key: string, value: any) => {
    const data = await loadData();
    data[key] = value;
    await saveData(data);
};

export const getData = async (key: string): Promise<any> => {
    const data = await loadData();
    return data[key];
};

