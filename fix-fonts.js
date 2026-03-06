const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app').concat(walk('./components'));
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  if (content.includes('font-outfit')) {
    content = content.replace(/font-outfit/g, 'font-sans'); // gracefully fallback to pingfang
    changed = true;
  }
  // tracking-widest applied to chinese text looks extremely bloated, we tone it down to standard or wide.
  if (content.match(/tracking-widest(?!.*?ENG)/)) {
    // just a simple replace for all "tracking-widest" since we are migrating to Feishu aesthetic which is tight and neat
    content = content.replace(/tracking-widest/g, 'tracking-normal'); 
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, content);
    count++;
    console.log(`Cleaned typography in ${f}`);
  }
});
console.log(`Fixed ${count} files globally.`);
