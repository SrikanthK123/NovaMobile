import fs from 'fs';
import path from 'path';

function walk(dir: string) {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules')) {
                results = results.concat(walk(file));
            }
        } else {
            results.push(file);
        }
    });
    return results;
}

console.log(walk('.').filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i)));
