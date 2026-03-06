const fs = require('fs');

const file = './components/content-factory/create-mode-input.tsx';
let content = fs.readFileSync(file, 'utf8');

// fix labels
content = content.replace(/className="text-sm font-bold text-foreground\/90 uppercase tracking-normal font-sans/g, 'className="text-sm font-semibold text-foreground/80 uppercase tracking-wide');

// fix spans inside labels (like "— 可选")
content = content.replace(/<span className="text-muted-foreground font-normal tracking-normal normal-case text-xs">/g, '<span className="text-muted-foreground/60 font-normal tracking-normal normal-case text-[13px]">');

// fix textareas and inputs
content = content.replace(/text-base font-medium text-foreground placeholder:text-muted-foreground/g, 'text-[15px] leading-relaxed font-medium text-foreground placeholder:text-[13px] placeholder:text-muted-foreground/40 placeholder:leading-relaxed');

// fix the "一键深度创作" buttons
content = content.replace(/text-base font-bold rounded-2xl shadow-brand/g, 'text-[15px] font-semibold tracking-wide rounded-2xl shadow-brand');
content = content.replace(/text-base font-bold rounded-2xl shadow-lg shadow-brand\/20/g, 'text-[15px] font-semibold tracking-wide rounded-2xl shadow-lg shadow-brand/20');

// fix mode switch text
content = content.replace(/text-sm font-bold leading-none font-sans/g, 'text-[15px] font-semibold tracking-tight leading-none');

fs.writeFileSync(file, content);
console.log('Fixed styling in create-mode-input.tsx');
