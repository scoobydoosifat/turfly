export const demoPitches = [
  {
    id: 'demo-football',
    name: 'The Canopy',
    sport: 'FOOTBALL',
    description: 'A bright covered 5-a-side court made for quick games and all-weather play.',
    location: 'Niketon, Dhaka',
    pricePerHour: 1800,
    capacity: 10,
    imageUrl: '/images/pitch-football.png',
    features: ['Covered roof', 'Changing room', 'Match lighting'],
    active: true,
  },
  {
    id: 'demo-night',
    name: 'Night Shift',
    sport: 'FOOTBALL',
    description: 'A floodlit 6-a-side pitch for late kick-offs and bigger teams.',
    location: 'Niketon, Dhaka',
    pricePerHour: 2200,
    capacity: 12,
    imageUrl: '/images/pitch-night.png',
    features: ['Pro floodlights', 'Parking', 'Drinking water'],
    active: true,
  },
  {
    id: 'demo-cricket',
    name: 'The Crease',
    sport: 'CRICKET',
    description: 'A dedicated netted cricket lane with a consistent synthetic wicket.',
    location: 'Niketon, Dhaka',
    pricePerHour: 1200,
    capacity: 8,
    imageUrl: '/images/pitch-cricket.png',
    features: ['Full safety net', 'Practice stumps', 'Equipment rental'],
    active: true,
  },
]

export const contact = {
  phone: '013089557984',
  email: 'sifatmazib625@gmail.com',
  address: 'Niketon, Dhaka',
}

export const money = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`

