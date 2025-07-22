// Класс для работы с хранилищем
class TravelDiaryStorage {
    constructor() {
        this.usersKey = 'travelDiaryUsers';
        this.travelsKey = 'travelDiaryTravels';
        this.currentUserKey = 'travelDiaryCurrentUser';
    }

    // Пользователи
    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    // Путешествия
    getTravels() {
        return JSON.parse(localStorage.getItem(this.travelsKey)) || [];
    }

    saveTravels(travels) {
        localStorage.setItem(this.travelsKey, JSON.stringify(travels));
    }

    // Текущий пользователь
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey));
    }

    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.currentUserKey);
        }
    }

    // Инициализация данных
    initialize() {
        if (!localStorage.getItem(this.usersKey)) {
            const demoUsers = [{ id: 1, username: 'demo', password: 'demo123', email: 'demo@example.com' }];
            this.saveUsers(demoUsers);
        }

        if (!localStorage.getItem(this.travelsKey)) {
            const demoTravels = [
                {
                    id: 1,
                    userId: 1,
                    username: 'demo',
                    title: 'Пример путешествия',
                    location: 'Париж, Франция',
                    date: '2023-05-15',
                    description: 'Прекрасное путешествие в столицу Франции с посещением Эйфелевой башни и Лувра.',
                    image: '',
                    cost: 50000,
                    safety: 5,
                    transport: 4,
                    places: 'Эйфелева башня, Лувр, Монмартр',
                    createdAt: new Date().toISOString(),
                },
            ];
            this.saveTravels(demoTravels);
        }
    }
}

// Класс приложения
class TravelDiaryApp {
    constructor() {
        this.storage = new TravelDiaryStorage();
        this.currentUser = null;
        this.isLoginMode = true;
        this.sortDescending = true;

        this.initElements();
        this.setupEventListeners();
        this.initialize();
    }

    initElements() {
        // Формы авторизации
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.showRegisterLink = document.getElementById('show-register');
        this.showLoginLink = document.getElementById('show-login');

        // Модальное окно авторизации
        this.authModal = document.getElementById('auth-modal');
        this.closeModal = document.querySelector('.close-modal');

        // Кнопки авторизации
        this.loginBtn = document.getElementById('login-btn');
        this.registerBtn = document.getElementById('register-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.authButtons = document.getElementById('auth-buttons');
        this.userProfile = document.getElementById('user-profile');
        this.usernameDisplay = document.getElementById('username-display');

        // Секции
        this.homeSection = document.getElementById('home-section');
        this.myTravelsSection = document.getElementById('my-travels-section');
        this.addTravelSection = document.getElementById('add-travel-section');
        this.exploreSection = document.getElementById('explore-section');

        // Навигация
        this.homeLink = document.getElementById('home-link');
        this.myTravelsLink = document.getElementById('my-travels-link');
        this.addTravelLink = document.getElementById('add-travel-link');
        this.exploreLink = document.getElementById('explore-link');

        // Форма добавления путешествия
        this.addTravelForm = document.getElementById('add-travel-form');
        this.getLocationBtn = document.getElementById('get-location-btn');
        this.locationCoords = document.getElementById('location-coords');
        this.travelImageInput = document.getElementById('travel-image');
        this.imagePreview = document.getElementById('image-preview');

        // Контейнеры для карточек
        this.featuredTravelsContainer = document.getElementById('featured-travels');
        this.myTravelsContainer = document.getElementById('my-travels');
        this.exploreTravelsContainer = document.getElementById('explore-travels');

        // Поиск и фильтры
        this.searchTravelInput = document.getElementById('search-travel');
        this.filterSafetySelect = document.getElementById('filter-safety');
        this.sortTravelsBtn = document.getElementById('sort-travels-btn');
    }

    setupEventListeners() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        }

        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        }

        if (this.showRegisterLink) {
            this.showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        if (this.showLoginLink) {
            this.showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        // Навигация
        if (this.homeLink) {
            this.homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('home');
                this.renderFeaturedTravels();
            });
        }
        // Формы авторизации
        this.loginForm?.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        this.registerForm?.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        this.showRegisterLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        this.showLoginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Навигация
        this.homeLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('home');
            this.renderFeaturedTravels();
        });

        this.myTravelsLink?.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.currentUser) {
                this.showAuthModal(true);
                return;
            }
            this.showSection('my-travels');
            this.renderMyTravels();
        });

        this.addTravelLink?.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.currentUser) {
                this.showAuthModal(true);
                return;
            }
            this.showSection('add-travel');
        });

        this.exploreLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('explore');
            this.renderExploreTravels();
        });

        // Авторизация
        this.loginBtn?.addEventListener('click', () => this.showAuthModal(true));
        this.registerBtn?.addEventListener('click', () => this.showAuthModal(false));
        this.logoutBtn?.addEventListener('click', () => this.logout());
        this.closeModal?.addEventListener('click', () => this.hideAuthModal());

        // Форма добавления путешествия
        this.addTravelForm?.addEventListener('submit', (e) => this.handleAddTravelSubmit(e));
        this.getLocationBtn?.addEventListener('click', () => this.getCurrentLocation());
        this.travelImageInput?.addEventListener('change', (e) => this.handleImageUpload(e));
        this.sortTravelsBtn?.addEventListener('click', () => this.toggleSortOrder());

        // Поиск и фильтры
        this.searchTravelInput?.addEventListener('input', () => this.renderExploreTravels());
        this.filterSafetySelect?.addEventListener('change', () => this.renderExploreTravels());

        // Клик по модальному окну
        this.authModal?.addEventListener('click', (e) => {
            if (e.target === this.authModal) {
                this.hideAuthModal();
            }
        });
    }

    initialize() {
        this.storage.initialize();
        this.currentUser = this.storage.getCurrentUser();
        this.updateAuthUI();
        this.showSection('home');
        this.renderFeaturedTravels();

        if (this.currentUser) {
            this.renderMyTravels();
        }

        this.renderExploreTravels();
    }

    // Работа с интерфейсом
    showSection(sectionName) {
        // Сбросить активные ссылки
        document.querySelectorAll('.main-nav a').forEach((link) => {
            link.classList.remove('active');
        });

        // Скрыть все секции
        [this.homeSection, this.myTravelsSection, this.addTravelSection, this.exploreSection].forEach((section) => {
            section?.classList.add('hidden');
        });

        // Показать нужную секцию и активировать ссылку
        switch (sectionName) {
            case 'home':
                this.homeSection?.classList.remove('hidden');
                this.homeLink?.classList.add('active');
                break;
            case 'my-travels':
                this.myTravelsSection?.classList.remove('hidden');
                this.myTravelsLink?.classList.add('active');
                break;
            case 'add-travel':
                this.addTravelSection?.classList.remove('hidden');
                this.addTravelLink?.classList.add('active');
                break;
            case 'explore':
                this.exploreSection?.classList.remove('hidden');
                this.exploreLink?.classList.add('active');
                break;
        }
    }

    updateAuthUI() {
        if (this.currentUser) {
            this.authButtons?.classList.add('hidden');
            this.userProfile?.classList.remove('hidden');
            this.usernameDisplay.textContent = this.currentUser.username;
        } else {
            this.authButtons?.classList.remove('hidden');
            this.userProfile?.classList.add('hidden');
        }
    }

    // Авторизация
    showAuthModal(loginMode) {
        this.isLoginMode = loginMode;
        if (loginMode) {
            this.showLoginForm();
        } else {
            this.showRegisterForm();
        }
        this.authModal?.classList.remove('hidden');
        this.authModal?.classList.add('show');
    }

    hideAuthModal() {
        this.authModal?.classList.remove('show');
        this.authModal?.classList.add('hidden');
    }

    showLoginForm() {
        this.loginForm?.classList.remove('hidden');
        this.registerForm?.classList.add('hidden');
    }

    showRegisterForm() {
        this.loginForm?.classList.add('hidden');
        this.registerForm?.classList.remove('hidden');
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        this.login(username, password);
    }

    handleRegisterSubmit(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const email = document.getElementById('register-email').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        this.register(username, password, email, confirmPassword);
    }

    register(username, password, email, confirmPassword) {
        // Валидация
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        const users = this.storage.getUsers();

        if (users.some((user) => user.username === username)) {
            alert('Пользователь с таким именем уже существует');
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            password,
            email,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        this.storage.saveUsers(users);

        alert('Регистрация успешна! Теперь вы можете войти.');
        this.showLoginForm();
        this.registerForm.reset();
    }

    login(username, password) {
        const users = this.storage.getUsers();
        const user = users.find((u) => u.username === username && u.password === password);

        if (!user) {
            alert('Неверное имя пользователя или пароль');
            return;
        }

        this.currentUser = user;
        this.storage.saveCurrentUser(user);
        this.updateAuthUI();
        this.hideAuthModal();
        this.loginForm.reset();

        // Показать "Мои путешествия" после входа
        this.showSection('my-travels');
        this.renderMyTravels();
    }

    logout() {
        this.currentUser = null;
        this.storage.saveCurrentUser(null);
        this.updateAuthUI();
        this.showSection('home');
        this.renderFeaturedTravels();
    }

    // Работа с геолокацией
    getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('Геолокация не поддерживается вашим браузером');
            return;
        }

        this.getLocationBtn.disabled = true;
        this.getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Определение...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.locationCoords.textContent = `Широта: ${latitude.toFixed(4)}, Долгота: ${longitude.toFixed(4)}`;
                this.getLocationBtn.innerHTML = '<i class="fas fa-check"></i> Местоположение определено';

                // Получаем название места с помощью Nominatim API (OpenStreetMap)
                this.getLocationName(latitude, longitude);
            },
            (error) => {
                alert('Не удалось определить местоположение: ' + error.message);
                this.getLocationBtn.disabled = false;
                this.getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Определить автоматически';
            }
        );
    }

    async getLocationName(lat, lon) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();

            if (data.display_name) {
                const locationInput = document.getElementById('travel-location');
                locationInput.value = data.display_name.split(',')[0]; // Берем только первую часть адреса
            }
        } catch (error) {
            console.error('Ошибка при получении названия места:', error);
        }
    }

    // Работа с изображениями
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Пожалуйста, выберите файл изображения');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Размер изображения не должен превышать 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            this.imagePreview.innerHTML = `<img src="${event.target.result}" alt="Предпросмотр">`;
            this.imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Работа с путешествиями
    handleAddTravelSubmit(e) {
        e.preventDefault();

        if (!this.currentUser) {
            alert('Для добавления путешествия необходимо войти в систему');
            return;
        }

        const title = document.getElementById('travel-title').value;
        const location = document.getElementById('travel-location').value;
        const date = document.getElementById('travel-date').value;
        const description = document.getElementById('travel-description').value;
        const cost = document.getElementById('travel-cost').value;
        const safety = document.getElementById('travel-safety').value;
        const transport = document.getElementById('travel-transport').value;
        const places = document.getElementById('travel-places').value;

        if (!title || !location || !date || !description) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Получаем изображение, если оно было загружено
        if (this.travelImageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const image = event.target.result;
                this.saveTravel(title, location, date, description, image, cost, safety, transport, places);
            };
            reader.readAsDataURL(this.travelImageInput.files[0]);
        } else {
            this.saveTravel(title, location, date, description, '', cost, safety, transport, places);
        }
    }

    saveTravel(title, location, date, description, image, cost, safety, transport, places) {
        const travels = this.storage.getTravels();
        const newTravel = {
            id: Date.now(),
            userId: this.currentUser.id,
            username: this.currentUser.username,
            title,
            location,
            date,
            description,
            image,
            cost: cost ? parseInt(cost) : 0,
            safety: safety ? parseInt(safety) : 0,
            transport: transport ? parseInt(transport) : 0,
            places,
            createdAt: new Date().toISOString(),
        };

        travels.push(newTravel);
        this.storage.saveTravels(travels);
        this.addTravelForm.reset();
        this.imagePreview.classList.add('hidden');
        this.imagePreview.innerHTML = '';
        this.locationCoords.textContent = '';

        alert('Путешествие успешно сохранено!');
        this.renderMyTravels();
    }

    toggleSortOrder() {
        this.sortDescending = !this.sortDescending;
        this.sortTravelsBtn.textContent = this.sortDescending ? 'Сортировать по дате (новые сначала)' : 'Сортировать по дате (старые сначала)';
        this.renderMyTravels();
    }

    renderFeaturedTravels() {
        const travels = this.storage.getTravels();
        const sortedTravels = [...travels].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const featured = sortedTravels.slice(0, 6);

        this.featuredTravelsContainer.innerHTML = featured.map((travel) => this.createTravelCard(travel)).join('');
    }

    renderMyTravels() {
        if (!this.currentUser) return;

        const travels = this.storage.getTravels().filter((travel) => travel.userId === this.currentUser.id);

        const sortedTravels = [...travels].sort((a, b) => (this.sortDescending ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));

        this.myTravelsContainer.innerHTML = sortedTravels.length ? sortedTravels.map((travel) => this.createTravelCard(travel, true)).join('') : '<p class="no-travels">У вас пока нет сохраненных путешествий</p>';
    }

    renderExploreTravels() {
        const searchTerm = this.searchTravelInput?.value.toLowerCase() || '';
        const safetyFilter = parseInt(this.filterSafetySelect?.value) || 0;

        const travels = this.storage
            .getTravels()
            .filter((travel) => {
                const matchesSearch = travel.title.toLowerCase().includes(searchTerm) || travel.location.toLowerCase().includes(searchTerm);
                const matchesSafety = safetyFilter === 0 || travel.safety === safetyFilter;
                return matchesSearch && matchesSafety;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        this.exploreTravelsContainer.innerHTML = travels.length ? travels.map((travel) => this.createTravelCard(travel)).join('') : '<p class="no-travels">Путешествия не найдены</p>';
    }

    createTravelCard(travel, withActions = false) {
        const imageSrc = travel.image || 'https://via.placeholder.com/400x300?text=No+Image';
        const costDisplay = travel.cost ? `<span class="travel-card-cost">${travel.cost.toLocaleString()} руб</span>` : '';

        const safetyStars = travel.safety
            ? `<div class="rating-item">
                  <span>Безопасность:</span>
                  <span class="rating-stars">${'★'.repeat(travel.safety)}${'☆'.repeat(5 - travel.safety)}</span>
               </div>`
            : '';

        const transportStars = travel.transport
            ? `<div class="rating-item">
                  <span>Транспорт:</span>
                  <span class="rating-stars">${'★'.repeat(travel.transport)}${'☆'.repeat(5 - travel.transport)}</span>
               </div>`
            : '';

        const placesList = travel.places ? `<p><strong>Места:</strong> ${travel.places}</p>` : '';

        const actions = withActions
            ? `<div class="travel-card-actions">
                  <button class="btn btn-primary edit-btn" data-id="${travel.id}">Редактировать</button>
                  <button class="btn btn-warning delete-btn" data-id="${travel.id}">Удалить</button>
               </div>`
            : '';

        return `
            <div class="travel-card" data-id="${travel.id}">
                <div class="travel-card-image">
                    <img src="${imageSrc}" alt="${travel.title}">
                </div>
                <div class="travel-card-content">
                    <h3 class="travel-card-title">${travel.title}</h3>
                    <div class="travel-card-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${travel.location}
                    </div>
                    <p class="travel-card-description">${travel.description}</p>
                    ${placesList}
                    <div class="travel-card-ratings">
                        ${safetyStars}
                        ${transportStars}
                    </div>
                    ${costDisplay}
                    <div class="travel-card-meta">
                        <span class="travel-card-author">${travel.username}</span>
                        <span class="travel-card-date">${new Date(travel.date).toLocaleDateString()}</span>
                    </div>
                    ${actions}
                </div>
            </div>
        `;
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new TravelDiaryApp();

    // Делегирование событий для динамически созданных элементов
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const travelId = parseInt(e.target.dataset.id);
            if (confirm('Вы уверены, что хотите удалить это путешествие?')) {
                const storage = new TravelDiaryStorage();
                const travels = storage.getTravels().filter((t) => t.id !== travelId);
                storage.saveTravels(travels);
                app.renderMyTravels();
                app.renderFeaturedTravels();
                app.renderExploreTravels();
            }
        }

        if (e.target.classList.contains('edit-btn')) {
            const travelId = parseInt(e.target.dataset.id);
            const storage = new TravelDiaryStorage();
            const travel = storage.getTravels().find((t) => t.id === travelId);

            if (travel) {
                app.showSection('add-travel');
                document.getElementById('travel-title').value = travel.title;
                document.getElementById('travel-location').value = travel.location;
                document.getElementById('travel-date').value = travel.date;
                document.getElementById('travel-description').value = travel.description;
                document.getElementById('travel-cost').value = travel.cost;
                document.getElementById('travel-safety').value = travel.safety;
                document.getElementById('travel-transport').value = travel.transport;
                document.getElementById('travel-places').value = travel.places;

                if (travel.image) {
                    app.imagePreview.innerHTML = `<img src="${travel.image}" alt="Предпросмотр">`;
                    app.imagePreview.classList.remove('hidden');
                }

                // Прокрутить к верху формы
                window.scrollTo(0, 0);
            }
        }
    });
});
