fetch('/api/restaurant')
  .then(response => response.json())
  .then(data => {
    const restaurantList = document.getElementById('restaurant-list');
    data.forEach(restaurant => {
      const div = document.createElement('div');
      div.innerHTML = `
        <h3>${restaurant.name}</h3>
        <p>${restaurant.description}</p>
        <img src="${restaurant.image}" alt="${restaurant.name}" width="100">
      `;
      restaurantList.appendChild(div);
    });
  })
  .catch(err => console.error('Error fetching restaurants:', err));
