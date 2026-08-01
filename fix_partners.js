async function run() {
  // Fetch current partners
  const res = await fetch('http://localhost:5000/api/partners');
  const data = await res.json();
  
  if (data.success && data.data) {
    for (const partner of data.data) {
      console.log(`Deleting partner: ${partner.name}`);
      await fetch(`http://localhost:5000/api/partners/${partner.id}`, { method: 'DELETE' });
    }
  }

  // Create the new correct partners
  const correctPartners = [
    { name: 'FIDE', logo_url: '/images/fide_logo.png', website_url: 'https://fide.com' },
    { name: 'The Gift of Chess', logo_url: '/images/gift_logo.jpg', website_url: 'https://thegiftofchess.org' },
    { name: 'Safaricom Foundation', logo_url: '/images/sponsers_backg.jpeg', website_url: 'https://www.safaricomfoundation.org' }
  ];

  for (const partner of correctPartners) {
    console.log(`Adding correct partner: ${partner.name}`);
    await fetch('http://localhost:5000/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner)
    });
  }
}
run().then(() => console.log('Done!')).catch(console.error);
