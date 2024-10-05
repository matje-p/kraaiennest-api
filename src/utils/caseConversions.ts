// triggering a build

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeysSnakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysSnakeToCamel(item)); // Recursively apply conversion to each object in the array
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = snakeToCamel(key);
            acc[camelKey] = convertKeysSnakeToCamel(obj[key]); // Recursively convert keys for nested objects
            return acc;
        }, {} as Record<string, any>);
    }
    return obj; // Return non-object, non-array values (including dates) as-is
}

export { snakeToCamel, convertKeysSnakeToCamel };
