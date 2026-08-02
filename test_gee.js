async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/gee/layer/aridity');
    const data = await res.json();
    const tileUrl = data.url.replace('{z}', 5).replace('{x}', 9).replace('{y}', 15);
    console.log('Fetching tile:', tileUrl);
    
    try {
      const tileRes = await fetch(tileUrl);
      console.log('Status:', tileRes.status);
      const text = await tileRes.text();
      console.log('Body:', text.substring(0, 200));
    } catch(e) {
      console.error('Error fetching tile:', e);
    }
  } catch (e) {
    console.error('Error getting layer url:', e.message);
  }
}
test();
