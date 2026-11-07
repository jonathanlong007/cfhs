let siteData = {};
let currentSlideIndex = 0;

// Fetch JSON data and initialize layout structures
fetch('./content.json')
    .then(response => response.json())
    .then(data => {
        siteData = data;
        renderNavigation();
        renderTopics();
        setActiveTopic(data.topics[0].id); // Default to first item
    });

// Injects top navigation bar dynamically
function renderNavigation() {
    const navContainer = document.getElementById('main-nav');
    navContainer.innerHTML = siteData.navigation
        .map(item => `<a href="${item.link}">${item.name}</a>`)
        .join('');
}

// Injects left side topics list
function renderTopics() {
    const topicContainer = document.getElementById('topics-sidebar');
    topicContainer.innerHTML = siteData.topics
        .map(topic => `
            <div class="topic-item" id="item-${topic.id}" onclick="setActiveTopic('${topic.id}')">
                <h2>${topic.title}</h2>
                <p>${topic.description}</p>
            </div>
        `).join('');
}

// Switches carousel photos when a left topic is active
function setActiveTopic(topicId) {
    // Clear active classes from sidebar items
    document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`item-${topicId}`).classList.add('active');

    // Find requested topic images
    const targetTopic = siteData.topics.find(t => t.id === topicId);
    const carouselContainer = document.getElementById('carousel-container');
    
    // Inject images cleanly
    carouselContainer.innerHTML = targetTopic.images
        .map(imgUrl => `<img src="${imgUrl}" alt="${targetTopic.title}">`)
        .join('');

    // Reset slide view index
    currentSlideIndex = 0;
    updateCarouselPosition();
}

// Shift carousel right or left
function moveSlide(direction) {
    const totalSlides = document.getElementById('carousel-container').children.length;
    if (totalSlides === 0) return;

    currentSlideIndex = (currentSlideIndex + direction + totalSlides) % totalSlides;
    updateCarouselPosition();
}

// Apply visual CSS transform slide transition
function updateCarouselPosition() {
    const container = document.getElementById('carousel-container');
    container.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
}
