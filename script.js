let products = [];
let cartItems = [];

const loadData = async () => {
    const response = await fetch('data.json');
    const data = await response.json();
    Array.from(data).forEach((product, index) => {
        data[index].id = `product-${index+1}`;
        data[index].selectedCount = 0;
    });
    return data;
}

const productsContainer = document.getElementById('_container');

window.addEventListener('load', async () => {
    products = await loadData();
    addProducts(products);
});

function handleClick(event) {
    console.log({event, target: event.currentTarget});
}

const updateCartListTemplate = (product) => {
    document.getElementById('empty-cart').style.display = 'none';
    document.getElementById('non-empty-cart').style.display = 'block';
    const cartListContainer = document.getElementById('cart-items');
    cartListContainer.innerHTML += getCartItemTemplate(product);
}

const removeFromCart = (event) => {
    const productId = getId(event.currentTarget.id);
    const index = cartItems.findIndex(item => item.id === productId);
    cartItems.splice(index, 1);
    const cartItemTemplate = document.getElementById(`${productId}-item`);
    cartItemTemplate.parentElement.removeChild(cartItemTemplate);
    updateCartItemsCount();
    checkCartItemsContainer();
    hideItemCounter(productId);
    updateTotalCost();
}

const addToCart = (event) => {
    const productId = getId(event.currentTarget.id);
    const product = products.find(product => product.id === productId);
    product.selectedCount = 1;
    cartItems.push(product);
    showItemCounter(productId);
    updateCartListTemplate(product);
    updateCartItemsCount();
    updateTotalCost();
}

const showDialog = () => {
    const listEl = document.getElementById('order-list');
    listEl.innerHTML = '';
    const orderCostEl = document.getElementById('order-cost');
    let cost = 0;
    cartItems.forEach(item => {
        listEl.innerHTML += getOrderItemTemplate(item);
        cost += (item.price * item.selectedCount);
    });
    const dialogEl = document.getElementById('_dialog');
    dialogEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    orderCostEl.innerText = '$' + cost.toFixed(2);
}

const hideDialog = () => {
    window.location.reload();
}

const addProducts = (products) => {
    Array.from(products).forEach((product, index) => {
        productsContainer.innerHTML += getProductTemplate(product, index);
    });
};

const getCartItemTemplate = (product) => {
    return `
        <div id="${product.id}-item" class="cart-item">
            <div class="left">
                <h4 class="item-name">${product.name}</h4>
                <span id="${product.id}-items-count" class="no-of-items">${product.selectedCount}x</span>
                <span class="cost-per-item">@${product.price}</span>
                <span id="${product.id}-items-cost" class="cost-of-total-items">$${product.price * product.selectedCount}</span>
            </div>
            <div class="right">
                <img onclick="removeFromCart(event)" id="${product.id}-remove-icon" class="remove-cart-item" src="assets/images/icon-remove-item.svg" alt="">
            </div>
        </div>
    `
};

const getOrderItemTemplate = (product) => {
    return `
        <div class="order-item">
            <div class="left">
                <div class="content">
                    <img src="${product.image.mobile}" alt="">

                    <div class="item-details">
                        <h3 class="name">
                            ${product.name}
                        </h3>

                        <p class="count-and-price">
                            <span class="count">${product.selectedCount}x</span>
                            <span class="price">@${product.price}</span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="right">
                <h3 class="cost">
                    $${product.price * product.selectedCount}
                </h3>
            </div>
        </div>
    `
}

const showItemCounter = (productId) => {
    const product = document.getElementById(productId);
    product.querySelector('.add-cart-button').style.display = 'none';
    product.querySelector('.item-counter').style.display = 'flex';
}

const hideItemCounter = (productId) => {
    const product = document.getElementById(productId);
    product.querySelector('.item-counter').style.display = 'none';
    product.querySelector('.add-cart-button').style.display = 'flex';
    const countEl = document.getElementById(`${productId}-count`);
    countEl.textContent = 1;
}

const increaseItemCount = (event) => {
    const productId = getId(event.currentTarget.id);
    const index = cartItems.findIndex(item => item.id === productId);
    if (index !== -1) {
        const product = cartItems[index];
        cartItems[index].selectedCount++;
        updateCartItemsCount();
        updateTotalCost();
        updateItemDetailsInTemplate(product, index);
    }
}

const decreaseItemCount = (event) => {
    const productId = getId(event.currentTarget.id);
    const index = cartItems.findIndex(item => item.id === productId);
    if (index !== -1 && cartItems[index].selectedCount > 1) {
        const product = cartItems[index];
        cartItems[index].selectedCount--;
        const countEl = document.getElementById(`${productId}-count`);
        countEl.textContent = cartItems[index].selectedCount;
        updateCartItemsCount();
        updateTotalCost();
        updateItemDetailsInTemplate(product, index);
    }
}

const updateItemDetailsInTemplate = (product, index) => {
    const countEl = document.getElementById(`${product.id}-count`);
    countEl.textContent = cartItems[index].selectedCount;

    const selectedItemsCountEl = document.getElementById(`${product.id}-items-count`);
    selectedItemsCountEl.textContent = product.selectedCount + 'x';
    const selectedItemsCostEl = document.getElementById(`${product.id}-items-cost`);
    selectedItemsCostEl.textContent = '$' + (product.selectedCount * product.price);
};

const getProductTemplate = (product, id) => {
    return `
        <div id="${product.id}" class="product">
            <div class="tumbnail-and-cart-button">
                <img class="product-image" src="${product.image.desktop}" alt="">
                
                <div class="cart-actions">
                    <button id="${product.id}-btn" onclick="addToCart(event)" type="button" class="add-cart-button">
                        <img src="assets/images/icon-add-to-cart.svg" alt="">
                        <span>Add to Cart</span>
                    </button>
                    <div style="display: none;" class="item-counter">
                        <button onclick="decreaseItemCount(event)" id="${product.id}-increment" class="counter-button" title="Decrement" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
                        </button>
                        <span id="${product.id}-count" class="items-count">1</span>
                        <button onclick="increaseItemCount(event)" id="${product.id}-decrement" class="counter-button" title="Increment" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="product-details">
                <span class="tag">${product.category}</span>
                <h4 class="name">${product.name}</h4>
                <span class="price">$${product.price}</span>
            </div>
        </div>
    `
};

const updateTotalCost = () => {
    const costEl = document.getElementById('_totalCost');
    let totalCost = 0;
    cartItems.forEach((product) => {
        const productCost = product.selectedCount * product.price;
        totalCost += productCost;
    });
    costEl.textContent = '$' + totalCost.toFixed(2);
}

const updateCartItemsCount = () => {
    const countEl = document.getElementById('cart-count');
    let count = 0;
    if (cartItems.length) {
        cartItems.forEach((item) => {
            count += item.selectedCount;
        });
    }
    countEl.textContent = count;
}

const getId = (string = '') => {
    return (string.split('-')[0] + '-' + string.split('-')[1]);
}

const checkCartItemsContainer = () => {
    const cartListContainer = document.getElementById('cart-items');
    
    if (!cartListContainer.children.length) {
        document.getElementById('non-empty-cart').style.display = 'none';
        document.getElementById('empty-cart').style.display = 'flex';
    }
}