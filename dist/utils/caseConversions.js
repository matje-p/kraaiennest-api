"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snakeToCamel = snakeToCamel;
exports.convertKeysSnakeToCamel = convertKeysSnakeToCamel;
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
function convertKeysSnakeToCamel(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysSnakeToCamel(item)); // Recursively apply conversion to each object in the array
    }
    else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = snakeToCamel(key);
            acc[camelKey] = convertKeysSnakeToCamel(obj[key]); // Recursively convert keys for nested objects
            return acc;
        }, {});
    }
    return obj; // Return non-object, non-array values (including dates) as-is
}
