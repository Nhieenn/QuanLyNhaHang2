const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ernwqsxxbvbqhrnqeryv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybndxc3h4YnZicWhybnFlcnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzM1NjYsImV4cCI6MjA5MDk0OTU2Nn0.equXQ4pzbiLl5rvilFkrDzxblo1XNz1EI-Wf-0Zbhyk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSalesTable() {
  console.log('--- Checking Sales Table ---');
  const { data, error } = await supabase.from('sales').select('*').limit(1);
  if (error) {
    console.log('Sales table does not exist or error:', error.message);
  } else {
    console.log('Sales table exists. Data head:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkSalesTable();
