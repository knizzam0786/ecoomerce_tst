document.addEventListener('DOMContentLoaded', () => {
  const productListRow = document.querySelector('.product_list');
  const loadMoreButton = document.getElementById('load_more');
  const checkboxes = document.querySelectorAll('.filter_catagories input[type="checkbox"]');
  const sortByPriceSelect = document.getElementById('sort_by_price');
  const productCountElement = document.querySelector('.product_count');
  const searchInput = document.querySelector('.search_column input[type="text"]');
  const searchButton = document.querySelector('.search_column .primary_btn');
  
  // Range filter elements
  const minRangeInput = document.querySelector('.min-range');
  const maxRangeInput = document.querySelector('.max-range');
  const minPriceInput = document.querySelector('.min-input');
  const maxPriceInput = document.querySelector('.max-input');
  const rangeSlider = document.querySelector('.slider_container .price_slider');
  
  let products = [];
  let filteredProducts = [];
  let currentIndex = 0;
  const productsPerPage = 10;

  // Fetch products from the API
  fetch('https://fakestoreapi.com/products')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      products = data;
      filteredProducts = [...products]; // Initially, all products are shown
      updateProductCount();
      productList();
      if (filteredProducts.length > productsPerPage) {
        loadMoreButton.style.display = 'block';
      }
    })
    .catch((error) => console.error('Error fetching data:', error));

  // Function to display products
  function productList() {
    const nextProducts = filteredProducts.slice(
      currentIndex,
      currentIndex + productsPerPage
    );

    if (currentIndex === 0) {
      productListRow.innerHTML = ''; // Clear the list if filtering or initial load
    }

    nextProducts.forEach((product) => {
      const productCol = document.createElement('div');
      productCol.classList.add('product_col');
      productCol.innerHTML = `
        <img src='${product.image}' alt='${product.title}'>
        <p>${product.title}</p>
        <span>$${product.price.toFixed(2)}</span>
        <p><i class="fa fa-heart-o" aria-hidden="true"></i></p>
      `;
      productListRow.appendChild(productCol);
    });

    currentIndex += productsPerPage;

    if (currentIndex >= filteredProducts.length) {
      loadMoreButton.style.display = 'none';
    } else {
      loadMoreButton.style.display = 'block';
    }
  }

  // Update product count
  function updateProductCount() {
    productCountElement.textContent = `${filteredProducts.length} Results`;
  }

  // Filter products based on range and other filters
  function filterProducts() {
    const selectedCategories = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    const minPrice = parseFloat(minPriceInput.value);
    const maxPrice = parseFloat(maxPriceInput.value);

    filteredProducts = products.filter((product) => {
      const inCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category.toLowerCase());
      const priceInRange = product.price >= minPrice && product.price <= maxPrice;
      return inCategory && priceInRange;
    });

    currentIndex = 0;
    sortProducts(); // Apply sorting to filtered products
    updateProductCount();
    productList();
  }

  // Sync range sliders with number inputs
  function syncPriceInputs() {
    const minValue = parseFloat(minRangeInput.value);
    const maxValue = parseFloat(maxRangeInput.value);

    minPriceInput.value = minValue;
    maxPriceInput.value = maxValue;

    const minPercent = (minValue / parseFloat(minRangeInput.max)) * 100;
    const maxPercent = (maxValue / parseFloat(maxRangeInput.max)) * 100;

    rangeSlider.style.left = `${minPercent}%`;
    rangeSlider.style.right = `${100 - maxPercent}%`;

    filterProducts(); // Apply filter when sliders change
  }

  // Sync number inputs with range sliders
  function syncPriceRanges() {
    const minValue = parseFloat(minPriceInput.value);
    const maxValue = parseFloat(maxPriceInput.value);

    minRangeInput.value = minValue;
    maxRangeInput.value = maxValue;

    syncPriceInputs();
  }

  // Event listeners for filters and sorting
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', filterProducts);
  });

  sortByPriceSelect.addEventListener('change', () => {
    currentIndex = 0;
    sortProducts();
    productList();
  });

   // Sort products based on selected price order
  function sortProducts() {
    const sortBy = sortByPriceSelect.value;

    if (sortBy === 'asc') {
      filteredProducts.sort((a, b) => a.price - b.price); // Low to High
    } else if (sortBy === 'desc') {
      filteredProducts.sort((a, b) => b.price - a.price); // High to Low
    }
  }

  // Filter products based on search input
  function searchProducts() {
    const searchQuery = searchInput.value.toLowerCase();

    if (!searchQuery) {
      filteredProducts = [...products]; // Reset to all products if search is empty
    } else {
      filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery)
      );
    }

    currentIndex = 0;
    updateProductCount();
    productList();
  }

  searchButton.addEventListener('click', searchProducts);

  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      searchProducts();
    }
  });

  loadMoreButton.addEventListener('click', productList);

  // Event listeners for price range sliders
  minRangeInput.addEventListener('input', syncPriceInputs);
  maxRangeInput.addEventListener('input', syncPriceInputs);

  // Event listeners for price inputs
  minPriceInput.addEventListener('change', syncPriceRanges);
  maxPriceInput.addEventListener('change', syncPriceRanges);
});
