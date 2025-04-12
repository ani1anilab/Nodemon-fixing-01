export async function getLocationFromAddress(address) {
  try {
    if (!address || typeof address !== 'string') {
      return { city: '', area: '' };
    }

    const parts = address.split(',').map(part => part.trim());
    if (parts.length < 2) return { city: '', area: '' };

    const lastPart = parts[parts.length - 2];
    const words = lastPart.split(' ');
    if (words.length < 2) return { city: '', area: '' };

    const postalCode = words.slice(-2).join(' ');
    const response = await fetch(`https://postcodes.io/postcodes/${encodeURIComponent(postalCode)}`);
    
    if (!response.ok) return { city: '', area: '' };
    
    const data = await response.json();
    return { 
      city: data?.result?.nutsNothing || 'Manchester',
      area: data?.result?.parliamentary_constituency_2024 || '' 
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return { city: '', area: '' };
  }
}