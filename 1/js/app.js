let siteData = {};
let currentSlideIndex = 0;
let currentActiveImages = [];

fetch('./content.json')
    .then(response => response.json())
    .then(data => {
        siteData = data;
        renderNavigation();
        renderCollapsibleTopics();
        
        // Auto-expand the very first topic by default
        if(siteData.topics.length > 0) {
            toggleTopicCard(siteData.topics[0].id);
        }
    });

function renderNavigation() {
    document.getElementById('main-nav').innerHTML = siteData.navigation
        .map(item => `<a href="${item.link}">${item.name}</a>`).join('');
}

// Builds the Collapsible Cards with Internal Jump Links
function renderCollapsibleTopics() {
    const sidebar = document.getElementById('topics-sidebar');
    
    sidebar.innerHTML = siteData.topics.map(topic => {
        // Generate internal links for the points navbar
        const miniNavHtml = topic.points.map(p => `
            <a href="#${p.pointId}" class="point-nav-link" 
               onclick="setActivePoint(event, '${topic.id}', '${p.pointId}')">${p.navLabel}</a>
        `).join('');

        // Generate lengthy content blocks
        const blocksHtml = topic.points.map(p => `
            <div class="point-content-block" id="${p.pointId}">
                <h3>${p.heading}</h3>
                <p>${p.text}</p>
            </div>
        `).join('');

        return `
            <div class="topic-card" id="card-${topic.id}">
                <div class="card-header" onclick="toggleTopicCard('${topic.id}')">
                    <span>${topic.title}</span>
                    <span class="chevron">&#10225;</span>
                </div>
                <div class="card-body">
                    <nav class="point-mini-nav">${miniNavHtml}</nav>
                    <div class="card-text-content">${blocksHtml}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Manages accordion behavior
function toggleTopicCard(topicId) {
    const card = document.getElementById(`card-${topicId}`);
    const isExpanded = card.classList.contains('expanded');
    
    // Close all open cards
    document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('expanded'));
    
    if (!isExpanded) {
        card.classList.add('expanded');
        // Activate the first point of this freshly opened topic
        const topic = siteData.topics.find(t => t.id === topicId);
        if (topic && topic.points.length > 0) {
            triggerPointActivation(topicId, topic.points[0].pointId);
        }
    }
}

// Handles user point-to-point clicking with smooth auto-scroll positioning
function setActivePoint(event, topicId, pointId) {
    event.preventDefault();
    event.stopPropagation(); // Avoid closing the accordion header
    
    triggerPointActivation(topicId, pointId);
    
    // Smoothly scroll the left column container directly to the targeted point header
    document.getElementById(pointId).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Low-level sync between selected content and the image array
function triggerPointActivation(topicId, pointId) {
    const card = document.getElementById(`card-${topicId}`);
    
    // Style active link highlights inside this specific mini nav
    card.querySelectorAll('.point-nav-link').forEach(link => link.classList.remove('active-point'));
    const targetLink = Array.from(card.querySelectorAll('.point-nav-link'))
        .find(link => link.getAttribute('href') === `#${pointId}`);
    if (targetLink) targetLink.classList.add('active-point');

    // Extract point visual payload
    const topic = siteData.topics.find(t => t.id === topicId);
    const point = topic.points.find(p => p.pointId === pointId);
    
    currentActiveImages = point.images;
    
    // Repopulate carousel stage
    const carouselContainer = document.getElementById('carousel-container');
    carouselContainer.innerHTML = currentActiveImages
        .map(url => `<img src="${url}" alt="${point.heading}">`).join('');

    currentSlideIndex = 0;
    updateCarouselPosition();
}

function moveSlide(direction) {
    //if (currentActiveImages.length === 0) return;
    currentSlideIndex = (currentSlideIndex + direction + currentActiveImages.length) //% currentActiveImages.length;
    updateCarouselPosition();
}

function updateCarouselPosition() {
    document.getElementById('carousel-container').style.transform = `translateX(-${currentSlideIndex * 100}%)`;
}
