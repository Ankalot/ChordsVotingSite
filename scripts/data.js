const supabase = createClient("https://bdyvbrbsjpueshknxyjk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeXZicmJzanB1ZXNoa254eWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMwNjUwMTUsImV4cCI6MjAxODY0MTAxNX0.YQpF30vC98GeAzll0Sz6YXg5gTSaB9tHJn23OR-2PG8");
// Don't hack my db pls :C

const {data, error} = await supabase.from('ChordsComparison').select(); 
if (error) {
    alert(error);
    return;
}
document.getElementById("dataHandler").textContent = JSON.stringify(data)