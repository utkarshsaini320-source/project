/* ==========================================================================
   STAYFINDER — script.js
   Vanilla JS only. Sections:
   1. Sample data
   2. State + localStorage helpers
   3. Rendering (property cards, locations, reviews, FAQ)
   4. Filtering / sorting
   5. Modals (details, booking, add-property, login) + gallery
   6. Wishlist
   7. Nav / theme / drawer / back-to-top / toasts
   8. Scroll reveal + stat counters
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 1. SAMPLE DATA                                                          */
/* ---------------------------------------------------------------------- */
const TYPE_LABELS = { hostel: 'Hostel', pg: 'PG', room: 'Room', house: 'House', hotel: 'Hotel' };

const SEED_PROPERTIES = [
  {
    id: 'p1', name: 'Sunrise Boys Hostel', type: 'hostel', location: 'Alwar, Rajasthan',
    price: 4500, unit: 'month', rating: 4.3, reviews: 128, featured: true, available: true,
    sharing: 'shared', createdAt: '2026-06-01',
    amenities: { furnished: true, ac: false, attachedBathroom: false, wifi: true, parking: true, food: true },
    description: 'A budget-friendly boys hostel close to the main college road, with home-style meals and a study hall open till midnight.',
    rules: ['No smoking inside rooms', 'Visitors allowed till 8 PM', 'ID proof required at check-in'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Ramesh Sharma', phone: '9876543210' }
  },
  {
    id: 'p2', name: 'Comfort PG', type: 'pg', location: 'Jaipur, Rajasthan',
    price: 7500, unit: 'month', rating: 4.5, reviews: 96, featured: true, available: true,
    sharing: 'double', createdAt: '2026-07-12',
    amenities: { furnished: true, ac: true, attachedBathroom: true, wifi: true, parking: false, food: true },
    description: 'Fully furnished PG for working professionals with daily housekeeping, three meals a day and high-speed Wi-Fi.',
    rules: ['No pets', 'Quiet hours after 10 PM', 'Monthly rent due by the 5th'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Neha Agarwal', phone: '9812345678' }
  },
  {
    id: 'p3', name: 'Green View Room', type: 'room', location: 'Bikaner, Rajasthan',
    price: 6000, unit: 'month', rating: 4.1, reviews: 54, featured: true, available: true,
    sharing: 'single', createdAt: '2026-05-20',
    amenities: { furnished: true, ac: false, attachedBathroom: true, wifi: true, parking: true, food: false },
    description: 'A quiet single room with a private balcony overlooking a garden, ideal for someone who values their own space.',
    rules: ['No overnight guests', 'Kitchen access shared', 'Electricity billed separately'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Suresh Rathi', phone: '9898989898' }
  },
  {
    id: 'p4', name: 'Royal House', type: 'house', location: 'Ajmer, Rajasthan',
    price: 15000, unit: 'month', rating: 4.7, reviews: 41, featured: true, available: false,
    sharing: 'shared', createdAt: '2026-04-02',
    amenities: { furnished: true, ac: true, attachedBathroom: true, wifi: true, parking: true, food: false },
    description: 'A spacious 3BHK independent house with a private courtyard, perfect for a small family or a group of friends.',
    rules: ['No sub-letting', 'Society maintenance included', 'One month security deposit'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Vikram Singh', phone: '9911223344' }
  },
  {
    id: 'p5', name: 'City Star Hotel', type: 'hotel', location: 'Jaipur, Rajasthan',
    price: 2500, unit: 'night', rating: 4.4, reviews: 312, featured: true, available: true,
    sharing: 'double', createdAt: '2026-07-28',
    amenities: { furnished: true, ac: true, attachedBathroom: true, wifi: true, parking: true, food: true },
    description: 'A centrally located hotel with rooftop dining, an in-house travel desk and easy access to the Pink City\'s main sights.',
    rules: ['Check-in 12 PM, check-out 11 AM', 'Government ID mandatory', 'No outside food in rooms'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'City Star Management', phone: '9700011122' }
  },
  {
    id: 'p6', name: 'Modern Living PG', type: 'pg', location: 'Delhi', price: 9000, unit: 'month',
    rating: 4.2, reviews: 77, featured: true, available: true, sharing: 'double', createdAt: '2026-08-05',
    amenities: { furnished: true, ac: true, attachedBathroom: true, wifi: true, parking: true, food: true },
    description: 'A well-connected PG near the metro with a modern interior, gym access and a rooftop lounge for residents.',
    rules: ['No smoking', 'Biometric entry', 'Visitors must register at the desk'],
    images: [
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Modern Living Group', phone: '9654321098' }
  },
  {
    id: 'p7', name: 'Heritage Backpackers Hostel', type: 'hostel', location: 'Jodhpur, Rajasthan',
    price: 3800, unit: 'month', rating: 4.6, reviews: 210, featured: false, available: true,
    sharing: 'shared', createdAt: '2026-08-15',
    amenities: { furnished: true, ac: false, attachedBathroom: false, wifi: true, parking: false, food: true },
    description: 'A lively backpacker hostel inside the old blue city, with a terrace cafe looking straight at Mehrangarh Fort.',
    rules: ['Curfew at midnight', 'Shared lockers provided', 'No loud music after 11 PM'],
    images: [
      'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541971875076-8f970d573be6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Kavita Bhati', phone: '9123456780' }
  },
  {
    id: 'p8', name: 'Lakeview Studio Room', type: 'room', location: 'Udaipur, Rajasthan',
    price: 8500, unit: 'month', rating: 4.0, reviews: 33, featured: false, available: true,
    sharing: 'single', createdAt: '2026-03-11',
    amenities: { furnished: true, ac: true, attachedBathroom: true, wifi: true, parking: false, food: false },
    description: 'A compact studio with a partial lake view, a kitchenette and a five-minute walk to the old city ghats.',
    rules: ['No smoking indoors', 'Water supply 6–9 AM & 6–9 PM', 'Advance rent for booking'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Meera Joshi', phone: '9345678120' }
  },
  {
    id: 'p9', name: 'Desert Marigold House', type: 'house', location: 'Jodhpur, Rajasthan',
    price: 18000, unit: 'month', rating: 4.8, reviews: 22, featured: false, available: true,
    sharing: 'shared', createdAt: '2026-08-22',
    amenities: { furnished: false, ac: true, attachedBathroom: true, wifi: true, parking: true, food: false },
    description: 'A four-bedroom haveli-style home with a rooftop terrace and views of the fort, ideal for extended families.',
    rules: ['Unfurnished — bring your own furniture', 'Two months security deposit', 'No commercial use'],
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Devraj Chauhan', phone: '9887766554' }
  },
  {
    id: 'p10', name: 'Golden Sands Hotel', type: 'hotel', location: 'Jaisalmer, Rajasthan',
    price: 3200, unit: 'night', rating: 4.5, reviews: 158, featured: false, available: true,
    sharing: 'double', createdAt: '2026-02-18',
    amenities: { furnished: true, ac: true, attachedBathroom: true, wifi: true, parking: true, food: true },
    description: 'A desert-view hotel with a pool, evening folk music and complimentary jeep transfers to the fort.',
    rules: ['Check-in 1 PM, check-out 10 AM', 'Alcohol served only in the lounge', 'ID mandatory for all guests'],
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Golden Sands Hospitality', phone: '9765432109' }
  },
  {
    id: 'p11', name: 'Scholar\'s Nest PG', type: 'pg', location: 'Kota, Rajasthan',
    price: 6500, unit: 'month', rating: 4.3, reviews: 189, featured: false, available: true,
    sharing: 'double', createdAt: '2026-06-30',
    amenities: { furnished: true, ac: false, attachedBathroom: true, wifi: true, parking: false, food: true },
    description: 'Built for exam-focused students, with dedicated study cabins, mess food four times a day and a strict quiet policy.',
    rules: ['Silent hours 6–9 PM daily', 'No outside guests in rooms', 'Weekly mess menu displayed'],
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Anil Mathur', phone: '9012345678' }
  },
  {
    id: 'p12', name: 'Palm Court Rooms', type: 'room', location: 'Delhi', price: 9500, unit: 'month',
    rating: 3.9, reviews: 18, featured: false, available: true, sharing: 'single', createdAt: '2026-01-09',
    amenities: { furnished: true, ac: true, attachedBathroom: false, wifi: true, parking: true, food: false },
    description: 'Well-lit rooms in a gated colony with 24/7 security guards and a small shared kitchen on every floor.',
    rules: ['No smoking', 'Guests must sign the register', 'Rent includes water and maintenance'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop'
    ],
    owner: { name: 'Palm Court Estates', phone: '9223344556' }
  }
];

const LOCATIONS = [
  { city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop' },
  { city: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop' },
  { city: 'Alwar', img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop' },
  { city: 'Bikaner', img: 'https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=800&auto=format&fit=crop' },
  { city: 'Ajmer', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop' },
  { city: 'Kota', img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop' },
  { city: 'Udaipur', img: 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?q=80&w=800&auto=format&fit=crop' },
  { city: 'Jodhpur', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop' }
];

const REVIEWS = [
  { name: 'Aditi Verma', rating: 5, text: 'Found a PG in Jaipur within a day of searching. The filters saved me from calling a dozen owners.', prop: 'Comfort PG' },
  { name: 'Rohit Malhotra', rating: 4, text: 'The hostel in Alwar was exactly as described — clean rooms and the food was better than expected.', prop: 'Sunrise Boys Hostel' },
  { name: 'Sana Khan', rating: 5, text: 'Booking the hotel for our Jaipur trip took five minutes. Loved the photo gallery before deciding.', prop: 'City Star Hotel' },
  { name: 'Karan Mehta', rating: 4, text: 'Listed my spare room in Delhi and got three genuine enquiries in the first week.', prop: 'Palm Court Rooms' },
  { name: 'Priya Nair', rating: 5, text: 'The Udaipur studio was even better in person — the lake view sold me instantly.', prop: 'Lakeview Studio Room' }
];

const FAQS = [
  { q: 'How can I search for a property?', a: 'Use the search box in the hero section — enter a city or area, pick a property type and a budget, then hit Search. You can also browse by property type or by city further down the page.' },
  { q: 'Can I filter properties by price?', a: 'Yes. Open the Filters panel above the property grid and set a minimum and maximum price, along with rating, amenities and room-sharing preferences.' },
  { q: 'How can I contact an owner?', a: 'Open any property\'s details and use the Contact owner button, or send a full booking enquiry with your preferred dates through the Book / Enquire button.' },
  { q: 'Can I save properties?', a: 'Tap the heart icon on any property card to add it to your wishlist. Saved properties stay in your browser and are available from the wishlist icon in the navbar.' },
  { q: 'How can I list my property?', a: 'Click Add Property in the navbar, fill in the details form and submit. In this demo, listings are stored in your browser and appear instantly in the grid.' },
  { q: 'Is booking available online?', a: 'This demo supports sending an enquiry online. A live version would connect the enquiry form to the owner\'s phone, email or an in-app messaging system.' }
];

/* ---------------------------------------------------------------------- */
/* 2. STATE + STORAGE                                                      */
/* ---------------------------------------------------------------------- */
const LS_KEYS = { wishlist: 'sf_wishlist', theme: 'sf_theme', userProps: 'sf_user_properties' };

function loadUserProperties(){
  try{ return JSON.parse(localStorage.getItem(LS_KEYS.userProps)) || []; } catch(e){ return []; }
}
function saveUserProperties(list){
  localStorage.setItem(LS_KEYS.userProps, JSON.stringify(list));
}
function loadWishlist(){
  try{ return JSON.parse(localStorage.getItem(LS_KEYS.wishlist)) || []; } catch(e){ return []; }
}
function saveWishlist(ids){
  localStorage.setItem(LS_KEYS.wishlist, JSON.stringify(ids));
}

const state = {
  properties: [...SEED_PROPERTIES, ...loadUserProperties()],
  wishlist: loadWishlist(),
  filters: { location: '', type: '', min: null, max: null, rating: 0, sharing: '', amenities: [] },
  sort: 'recommended',
  currentDetailsId: null,
  galleryIndex: 0,
  reviewIndex: 0
};

/* ---------------------------------------------------------------------- */
/* 3. RENDERING                                                            */
/* ---------------------------------------------------------------------- */
const grid = document.getElementById('propertyGrid');
const emptyState = document.getElementById('emptyState');
const resultsMeta = document.getElementById('resultsMeta');

function starString(rating){
  const full = Math.round(rating);
  return '<i class="fa-solid fa-star"></i> ' + rating.toFixed(1) + ' <span style="color:var(--text-faint);font-weight:600;">(' + full + ')</span>';
}

function amenityTags(a){
  const map = { furnished: 'Furnished', ac: 'AC', attachedBathroom: 'Attached bath', wifi: 'Wi-Fi', parking: 'Parking', food: 'Food' };
  return Object.keys(map).filter(k => a[k]).map(k => `<span class="mini-tag">${map[k]}</span>`).join('');
}

function renderPropertyCard(p){
  const inWishlist = state.wishlist.includes(p.id);
  const priceUnit = p.unit === 'night' ? '/night' : '/month';
  return `
  <article class="property-card" data-id="${p.id}">
    <div class="card-img">
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      ${p.featured ? '<span class="card-badge">Featured</span>' : ''}
      <span class="card-status ${p.available ? 'available' : 'occupied'}">${p.available ? 'Available' : 'Occupied'}</span>
      <button class="card-heart ${inWishlist ? 'active' : ''}" data-wish="${p.id}" aria-label="Save to wishlist">
        <i class="fa-${inWishlist ? 'solid' : 'regular'} fa-heart"></i>
      </button>
    </div>
    <div class="card-body">
      <span class="card-type">${TYPE_LABELS[p.type]}</span>
      <h3>${p.name}</h3>
      <p class="card-loc"><i class="fa-solid fa-location-dot"></i> ${p.location}</p>
      <div class="rating">${starString(p.rating)}</div>
      <div class="card-amenities">${amenityTags(p.amenities)}</div>
      <div class="card-foot">
        <span class="card-price">₹${p.price.toLocaleString('en-IN')}<small> ${priceUnit}</small></span>
        <button class="view-btn" data-view="${p.id}">View Details</button>
      </div>
    </div>
  </article>`;
}

function applyFiltersAndSort(){
  const f = state.filters;
  let list = state.properties.filter(p => {
    if (f.location && !p.location.toLowerCase().includes(f.location.toLowerCase())) return false;
    if (f.type && p.type !== f.type) return false;
    if (f.min != null && p.price < f.min) return false;
    if (f.max != null && p.price > f.max) return false;
    if (f.rating && p.rating < f.rating) return false;
    if (f.sharing && p.sharing !== f.sharing) return false;
    if (f.amenities.length && !f.amenities.every(a => p.amenities[a])) return false;
    return true;
  });

  switch (state.sort){
    case 'price-asc': list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'rating-desc': list.sort((a,b) => b.rating - a.rating); break;
    case 'newest': list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    default: list.sort((a,b) => (b.featured - a.featured) || (b.rating - a.rating));
  }
  return list;
}

function renderGrid(){
  const list = applyFiltersAndSort();
  grid.innerHTML = list.map(renderPropertyCard).join('');
  emptyState.hidden = list.length !== 0;
  resultsMeta.textContent = `Showing ${list.length} of ${state.properties.length} properties`;
}

function renderLocations(){
  const counts = {};
  state.properties.forEach(p => {
    const city = p.location.split(',')[0].trim();
    counts[city] = (counts[city] || 0) + 1;
  });
  const container = document.getElementById('locationGrid');
  container.innerHTML = LOCATIONS.map(l => `
    <div class="location-card" data-city="${l.city}">
      <img src="${l.img}" alt="${l.city}" loading="lazy">
      <div class="location-overlay">
        <h3>${l.city}</h3>
        <span>${counts[l.city] || 0} properties</span>
        <span class="loc-explore">Explore <i class="fa-solid fa-arrow-right-long"></i></span>
      </div>
    </div>`).join('');
}

function renderReviews(){
  const track = document.getElementById('reviewTrack');
  const dots = document.getElementById('reviewDots');
  track.innerHTML = `<div class="review-track-inner" id="reviewTrackInner">` +
    REVIEWS.map(r => `
      <div class="review-card">
        <img class="review-avatar" src="https://i.pravatar.cc/100?u=${encodeURIComponent(r.name)}" alt="${r.name}">
        <div class="rating">${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}${'<i class="fa-regular fa-star" style="color:var(--line);"></i>'.repeat(5-r.rating)}</div>
        <p class="review-text">"${r.text}"</p>
        <p class="review-name">${r.name}</p>
        <p class="review-prop">Stayed at ${r.prop}</p>
      </div>`).join('') + `</div>`;
  dots.innerHTML = REVIEWS.map((_,i) => `<button data-dot="${i}" class="${i===0?'active':''}" aria-label="Go to review ${i+1}"></button>`).join('');
}

function renderFaq(){
  const list = document.getElementById('faqList');
  list.innerHTML = FAQS.map((f,i) => `
    <div class="faq-item" data-faq="${i}">
      <button class="faq-q">${f.q} <i class="fa-solid fa-plus"></i></button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>`).join('');
}

/* ---------------------------------------------------------------------- */
/* 4. FILTER / SORT WIRING                                                 */
/* ---------------------------------------------------------------------- */
const filterToggle = document.getElementById('filterToggle');
const filterPanel = document.getElementById('filterPanel');
filterToggle.addEventListener('click', () => filterPanel.classList.toggle('open'));

document.getElementById('applyFilters').addEventListener('click', () => {
  state.filters.location = document.getElementById('fLocation').value.trim();
  state.filters.type = document.getElementById('fType').value;
  const min = document.getElementById('fMin').value;
  const max = document.getElementById('fMax').value;
  state.filters.min = min ? Number(min) : null;
  state.filters.max = max ? Number(max) : null;
  state.filters.rating = Number(document.getElementById('fRating').value);
  state.filters.sharing = document.getElementById('fSharing').value;
  state.filters.amenities = Array.from(document.querySelectorAll('[data-amenity]:checked')).map(el => el.dataset.amenity);
  renderGrid();
  showToast('Filters applied', 'filter');
});

document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('fLocation').value = '';
  document.getElementById('fType').value = '';
  document.getElementById('fMin').value = '';
  document.getElementById('fMax').value = '';
  document.getElementById('fRating').value = '0';
  document.getElementById('fSharing').value = '';
  document.querySelectorAll('[data-amenity]').forEach(el => el.checked = false);
  state.filters = { location: '', type: '', min: null, max: null, rating: 0, sharing: '', amenities: [] };
  renderGrid();
});

document.getElementById('sortBy').addEventListener('change', e => {
  state.sort = e.target.value;
  renderGrid();
});

// Search hero form -> feeds main filters and scrolls to grid
document.getElementById('searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const loc = document.getElementById('searchLocation').value.trim();
  const type = document.getElementById('searchType').value;
  const budget = document.getElementById('searchBudget').value;

  state.filters.location = loc;
  state.filters.type = type;
  if (budget){
    const [min, max] = budget.split('-').map(Number);
    state.filters.min = min; state.filters.max = max;
  } else {
    state.filters.min = null; state.filters.max = null;
  }
  document.getElementById('fLocation').value = loc;
  document.getElementById('fType').value = type;

  renderGrid();
  document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });
});

// Nav / footer / type-card links that pre-filter by type
document.querySelectorAll('[data-filter-type]').forEach(el => {
  el.addEventListener('click', e => {
    const type = el.dataset.filterType;
    state.filters.type = type;
    document.getElementById('fType').value = type;
    renderGrid();
  });
});
document.querySelectorAll('[data-explore]').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.explore;
    state.filters.type = type;
    document.getElementById('fType').value = type;
    renderGrid();
    document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });
  });
});

// Location card click filters by city
document.getElementById('locationGrid').addEventListener('click', e => {
  const card = e.target.closest('.location-card');
  if (!card) return;
  const city = card.dataset.city;
  state.filters.location = city;
  document.getElementById('fLocation').value = city;
  renderGrid();
  document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });
});

/* ---------------------------------------------------------------------- */
/* 5. MODALS: DETAILS / BOOKING / ADD PROPERTY / LOGIN                     */
/* ---------------------------------------------------------------------- */
function openModal(id){
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id){
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){
    document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
    closeWishlistPanel();
    closeMobileDrawer();
  }
});

// Grid click delegation: view details + wishlist heart
grid.addEventListener('click', e => {
  const viewBtn = e.target.closest('[data-view]');
  const wishBtn = e.target.closest('[data-wish]');
  if (viewBtn) openDetails(viewBtn.dataset.view);
  if (wishBtn) toggleWishlist(wishBtn.dataset.wish, wishBtn);
});

function findProperty(id){ return state.properties.find(p => p.id === id); }

function openDetails(id){
  const p = findProperty(id);
  if (!p) return;
  state.currentDetailsId = id;
  state.galleryIndex = 0;

  document.getElementById('detailsType').textContent = TYPE_LABELS[p.type];
  document.getElementById('detailsTitle').textContent = p.name;
  document.getElementById('detailsLoc').textContent = p.location;
  document.getElementById('detailsPrice').textContent = `₹${p.price.toLocaleString('en-IN')} ${p.unit === 'night' ? '/ night' : '/ month'}`;
  document.getElementById('detailsRating').innerHTML = starString(p.rating) + ` <span style="color:var(--text-faint);font-weight:600;">· ${p.reviews || 0} reviews</span>`;
  document.getElementById('detailsDesc').textContent = p.description;
  document.getElementById('detailsAmenities').innerHTML = amenityTags(p.amenities) || '<span class="mini-tag">Basic amenities</span>';
  document.getElementById('detailsRules').innerHTML = (p.rules || []).map(r => `<li>${r}</li>`).join('');
  document.getElementById('detailsAvailability').textContent = p.available
    ? 'This property currently has rooms available — send an enquiry to check dates.'
    : 'This property is fully occupied right now, but you can still contact the owner about a waitlist.';

  renderGallery(p);
  updateWishlistButton(p.id);

  document.getElementById('bPropertyName').value = p.name;
  document.getElementById('contactOwnerBtn').onclick = () => {
    showToast(`Owner contact: ${p.owner.name} · ${p.owner.phone}`, 'phone');
  };
  document.getElementById('bookEnquireBtn').onclick = () => {
    closeModal('detailsModal');
    openModal('bookingModal');
  };
  document.getElementById('detailsWishlistBtn').onclick = () => {
    toggleWishlist(p.id);
    updateWishlistButton(p.id);
  };

  openModal('detailsModal');
}

function updateWishlistButton(id){
  const btn = document.getElementById('detailsWishlistBtn');
  const active = state.wishlist.includes(id);
  btn.innerHTML = active ? '<i class="fa-solid fa-heart"></i> Saved' : '<i class="fa-regular fa-heart"></i> Save';
}

function renderGallery(p){
  const main = document.getElementById('galleryMain');
  const thumbs = document.getElementById('galleryThumbs');
  const counter = document.getElementById('galleryCounter');
  main.src = p.images[state.galleryIndex];
  main.alt = p.name;
  counter.textContent = `${state.galleryIndex + 1} / ${p.images.length}`;
  thumbs.innerHTML = p.images.map((src, i) => `<img src="${src}" data-i="${i}" class="${i === state.galleryIndex ? 'active' : ''}" alt="Thumbnail ${i+1}">`).join('');
}
document.getElementById('galleryPrev').addEventListener('click', () => stepGallery(-1));
document.getElementById('galleryNext').addEventListener('click', () => stepGallery(1));
function stepGallery(dir){
  const p = findProperty(state.currentDetailsId);
  if (!p) return;
  state.galleryIndex = (state.galleryIndex + dir + p.images.length) % p.images.length;
  renderGallery(p);
}
document.getElementById('galleryThumbs').addEventListener('click', e => {
  const img = e.target.closest('img[data-i]');
  if (!img) return;
  state.galleryIndex = Number(img.dataset.i);
  renderGallery(findProperty(state.currentDetailsId));
});

/* ---- Booking / enquiry form ---- */
const bookingForm = document.getElementById('bookingForm');
bookingForm.addEventListener('submit', e => {
  e.preventDefault();
  const fields = [
    { id: 'bFullName', test: v => v.trim().length > 1, msg: 'Please enter your full name' },
    { id: 'bMobile', test: v => /^[0-9]{10}$/.test(v), msg: 'Enter a valid 10-digit mobile number' },
    { id: 'bEmail', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Enter a valid email address' },
    { id: 'bCheckin', test: v => !!v, msg: 'Select a check-in date' },
    { id: 'bCheckout', test: v => !!v, msg: 'Select a check-out date' },
    { id: 'bGuests', test: v => Number(v) >= 1, msg: 'At least 1 guest is required' }
  ];
  let valid = true;
  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const wrap = input.closest('.form-field');
    const ok = f.test(input.value);
    wrap.classList.toggle('invalid', !ok);
    wrap.querySelector('.error-msg').textContent = ok ? '' : f.msg;
    if (!ok) valid = false;
  });
  const inDate = document.getElementById('bCheckin').value;
  const outDate = document.getElementById('bCheckout').value;
  if (inDate && outDate && outDate <= inDate){
    const wrap = document.getElementById('bCheckout').closest('.form-field');
    wrap.classList.add('invalid');
    wrap.querySelector('.error-msg').textContent = 'Check-out must be after check-in';
    valid = false;
  }
  if (!valid) return;

  showToast('Enquiry sent — the owner will get back to you soon', 'check');
  bookingForm.reset();
  document.querySelectorAll('#bookingForm .form-field').forEach(w => w.classList.remove('invalid'));
  closeModal('bookingModal');
});

/* ---- Add property form ---- */
document.getElementById('addPropertyBtn').addEventListener('click', () => openModal('addModal'));
document.getElementById('mobileAddBtn').addEventListener('click', () => { closeMobileDrawer(); openModal('addModal'); });

const addForm = document.getElementById('addForm');
addForm.addEventListener('submit', e => {
  e.preventDefault();
  const req = [
    { id: 'aOwner', test: v => v.trim().length > 1, msg: 'Enter the owner name' },
    { id: 'aName', test: v => v.trim().length > 1, msg: 'Enter a property name' },
    { id: 'aType', test: v => !!v, msg: 'Select a property type' },
    { id: 'aLocation', test: v => v.trim().length > 1, msg: 'Enter a location' },
    { id: 'aRent', test: v => Number(v) > 0, msg: 'Enter a valid rent amount' },
    { id: 'aPhone', test: v => /^[0-9]{10}$/.test(v), msg: 'Enter a valid 10-digit phone number' },
    { id: 'aDesc', test: v => v.trim().length > 9, msg: 'Add a short description (10+ characters)' }
  ];
  let valid = true;
  req.forEach(f => {
    const input = document.getElementById(f.id);
    const wrap = input.closest('.form-field');
    const ok = f.test(input.value);
    wrap.classList.toggle('invalid', !ok);
    wrap.querySelector('.error-msg').textContent = ok ? '' : f.msg;
    if (!ok) valid = false;
  });
  if (!valid) return;

  const amenities = {};
  document.querySelectorAll('[data-a-amenity]').forEach(el => { amenities[el.dataset.aAmenity] = el.checked; });

  const rawImages = document.getElementById('aImages').value.trim();
  const images = rawImages ? rawImages.split(',').map(s => s.trim()).filter(Boolean) : [];
  const fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop';

  const newProp = {
    id: 'u' + Date.now(),
    name: document.getElementById('aName').value.trim(),
    type: document.getElementById('aType').value,
    location: document.getElementById('aLocation').value.trim(),
    price: Number(document.getElementById('aRent').value),
    unit: document.getElementById('aRentUnit').value,
    rating: 0, reviews: 0, featured: false,
    available: document.getElementById('aAvailability').value === 'available',
    sharing: 'shared',
    createdAt: new Date().toISOString().slice(0,10),
    amenities,
    description: document.getElementById('aDesc').value.trim(),
    rules: ['Contact owner for full house rules'],
    images: images.length ? images : [fallback],
    owner: { name: document.getElementById('aOwner').value.trim(), phone: document.getElementById('aPhone').value.trim() }
  };

  state.properties.unshift(newProp);
  const userList = loadUserProperties();
  userList.unshift(newProp);
  saveUserProperties(userList);

  renderGrid();
  renderLocations();
  addForm.reset();
  document.querySelectorAll('#addForm .form-field').forEach(w => w.classList.remove('invalid'));
  closeModal('addModal');
  showToast('Your property is now listed', 'check');
  document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });
}); 

/* ---- Login (demo) ---- */
document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
document.getElementById('mobileLoginBtn').addEventListener('click', () => { closeMobileDrawer(); openModal('loginModal'); });
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('lEmail');
  const pass = document.getElementById('lPassword');
  let valid = true;
  [ [email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value), 'Enter a valid email'],
    [pass, pass.value.length >= 4, 'Password must be at least 4 characters'] ].forEach(([input, ok, msg]) => {
    const wrap = input.closest('.form-field');
    wrap.classList.toggle('invalid', !ok);
    wrap.querySelector('.error-msg').textContent = ok ? '' : msg;
    if (!ok) valid = false;
  });
  if (!valid) return;
  closeModal('loginModal');
  showToast('Signed in — welcome back!', 'check');
  e.target.reset();
});

/* ---------------------------------------------------------------------- */
/* 6. WISHLIST                                                             */
/* ---------------------------------------------------------------------- */
function toggleWishlist(id, btnEl){
  const idx = state.wishlist.indexOf(id);
  if (idx > -1){ state.wishlist.splice(idx,1); }
  else { state.wishlist.push(id); }
  saveWishlist(state.wishlist);
  updateWishlistCount();
  renderWishlistPanel();

  // Update any matching heart buttons in the grid
  document.querySelectorAll(`[data-wish="${id}"]`).forEach(el => {
    const active = state.wishlist.includes(id);
    el.classList.toggle('active', active);
    el.querySelector('i').className = `fa-${active ? 'solid' : 'regular'} fa-heart`;
    el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 400);
  });

  if (state.currentDetailsId === id) updateWishlistButton(id);
  showToast(state.wishlist.includes(id) ? 'Added to wishlist' : 'Removed from wishlist', 'heart');
}

function updateWishlistCount(){
  const badge = document.getElementById('wishlistCount');
  badge.textContent = state.wishlist.length;
  document.getElementById('wishlistOpenBtn').classList.toggle('is-active', state.wishlist.length > 0);
}

function renderWishlistPanel(){
  const body = document.getElementById('wishlistBody');
  if (!state.wishlist.length){
    body.innerHTML = '<p class="wish-empty">Your wishlist is empty. Tap the heart on any property to save it here.</p>';
    return;
  }
  body.innerHTML = state.wishlist.map(id => {
    const p = findProperty(id);
    if (!p) return '';
    return `
    <div class="wish-item" data-id="${p.id}">
      <img src="${p.images[0]}" alt="${p.name}">
      <div class="wish-item-body">
        <h4>${p.name}</h4>
        <p>${p.location} · ₹${p.price.toLocaleString('en-IN')}${p.unit === 'night' ? '/night' : '/month'}</p>
      </div>
      <button class="wish-remove" data-remove="${p.id}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
    </div>`;
  }).join('');
}
document.getElementById('wishlistBody').addEventListener('click', e => {
  const btn = e.target.closest('[data-remove]');
  if (btn) toggleWishlist(btn.dataset.remove);
});

const wishlistPanel = document.getElementById('wishlistPanel');
const wishlistOverlay = document.getElementById('wishlistOverlay');
function openWishlistPanel(){ wishlistPanel.classList.add('open'); wishlistOverlay.classList.add('open'); }
function closeWishlistPanel(){ wishlistPanel.classList.remove('open'); wishlistOverlay.classList.remove('open'); }
document.getElementById('wishlistOpenBtn').addEventListener('click', openWishlistPanel);
document.getElementById('closeWishlist').addEventListener('click', closeWishlistPanel);
wishlistOverlay.addEventListener('click', closeWishlistPanel);

/* ---------------------------------------------------------------------- */
/* 7. NAV / THEME / DRAWER / BACK-TO-TOP / TOASTS / NOTIFICATIONS          */
/* ---------------------------------------------------------------------- */
// Theme toggle
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggle').innerHTML = theme === 'dark'
    ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem(LS_KEYS.theme, theme);
}
const savedTheme = localStorage.getItem(LS_KEYS.theme) ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);
document.getElementById('themeToggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

// Mobile drawer
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
function openMobileDrawer(){ hamburger.classList.add('open'); mobileDrawer.classList.add('open'); drawerOverlay.classList.add('open'); }
function closeMobileDrawer(){ hamburger.classList.remove('open'); mobileDrawer.classList.remove('open'); drawerOverlay.classList.remove('open'); }
hamburger.addEventListener('click', () => mobileDrawer.classList.contains('open') ? closeMobileDrawer() : openMobileDrawer());
drawerOverlay.addEventListener('click', closeMobileDrawer);
document.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', closeMobileDrawer));

// Active nav link on scroll
const navSections = ['home','explore','properties','why','footer'];
window.addEventListener('scroll', () => {
  let current = navSections[0];
  navSections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 140) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current && !link.dataset.filterType);
  });
}, { passive: true });

// Notifications (demo)
document.getElementById('notifBtn').addEventListener('click', () => {
  document.getElementById('notifDot').hidden = true;
  showToast('You are all caught up', 'bell');
});

// Back to top
document.getElementById('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Toasts
const ICONS = { check: 'circle-check', heart: 'heart', filter: 'sliders', phone: 'phone', bell: 'bell' };
function showToast(message, icon){
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<i class="fa-solid fa-${ICONS[icon] || 'circle-check'}"></i><span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* ---------------------------------------------------------------------- */
/* 8. FAQ ACCORDION + REVIEW SLIDER + SCROLL REVEAL + COUNTERS             */
/* ---------------------------------------------------------------------- */
document.getElementById('faqList').addEventListener('click', e => {
  const q = e.target.closest('.faq-q');
  if (!q) return;
  q.closest('.faq-item').classList.toggle('open');
});

function goToReview(i){
  state.reviewIndex = (i + REVIEWS.length) % REVIEWS.length;
  const inner = document.getElementById('reviewTrackInner');
  inner.style.transform = `translateX(-${state.reviewIndex * 100}%)`;
  document.querySelectorAll('#reviewDots button').forEach((d, idx) => d.classList.toggle('active', idx === state.reviewIndex));
}
document.getElementById('reviewPrev').addEventListener('click', () => goToReview(state.reviewIndex - 1));
document.getElementById('reviewNext').addEventListener('click', () => goToReview(state.reviewIndex + 1));
document.getElementById('reviewDots').addEventListener('click', e => {
  const btn = e.target.closest('[data-dot]');
  if (btn) goToReview(Number(btn.dataset.dot));
});
let reviewTimer = setInterval(() => goToReview(state.reviewIndex + 1), 6000);

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
function observeReveals(){
  document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
}

// Animated stat counters (why-choose-us section)
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach(el => {
      const target = Number(el.dataset.count);
      const isDecimal = el.hasAttribute('data-decimal');
      const duration = 1400;
      const start = performance.now();
      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('en-IN');
      }
      requestAnimationFrame(tick);
    });
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });
const whyStats = document.querySelector('.why-stats');
if (whyStats) statObserver.observe(whyStats);

/* ---------------------------------------------------------------------- */
/* INIT                                                                     */
/* ---------------------------------------------------------------------- */
function init(){
  renderGrid();
  renderLocations();
  renderReviews();
  renderFaq();
  updateWishlistCount();
  renderWishlistPanel();
  observeReveals();
  // Re-observe after dynamic content injected (grid etc. don't use reveal, but keep hook)
  setTimeout(observeReveals, 300);
}
document.addEventListener('DOMContentLoaded', init);
