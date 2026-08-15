const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/exercises?select=id,title,statement_body,solution_body`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  
  for (const ex of data) {
    let hasError = false;
    
    // Pattern 1: Unescaped < followed by a letter or /
    if (ex.statement_body && ex.statement_body.match(/<[a-zA-Z\/]/)) {
      console.log('Found <tag in statement:', ex.id, ex.title);
      hasError = true;
    }
    if (ex.solution_body && ex.solution_body.match(/<[a-zA-Z\/]/)) {
      console.log('Found <tag in solution:', ex.id, ex.title);
      hasError = true;
    }
    
    // Pattern 2: Unbalanced braces
    const checkBraces = (text) => {
       if (!text) return false;
       let depth = 0;
       for (let i = 0; i < text.length; i++) {
         if (text[i] === '{') depth++;
         if (text[i] === '}') depth--;
       }
       return depth !== 0;
    };
    if (checkBraces(ex.statement_body)) {
      console.log('Unbalanced braces in statement:', ex.id, ex.title);
      hasError = true;
    }
    if (checkBraces(ex.solution_body)) {
      console.log('Unbalanced braces in solution:', ex.id, ex.title);
      hasError = true;
    }
  }
}
main();
