const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:3001/api/gee/layer/aridity');
    const tileUrl = res.data.url.replace('{z}', 5).replace('{x}', 9).replace('{y}', 15);
    console.log('Fetching tile:', tileUrl);
    
    try {
      const tileRes = await axios.get(tileUrl, { responseType: 'arraybuffer' });
      console.log('Tile fetched successfully, size:', tileRes.data.length);
    } catch(e) {
      console.error('Error fetching tile:', e.response ? e.response.status : e.message);
      if (e.response && e.response.data) {
        console.error('Error body:', e.response.data.toString());
      }
    }
  } catch (e) {
    console.error('Error getting layer url:', e.message);
  }
}
test();
