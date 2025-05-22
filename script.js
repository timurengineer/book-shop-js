// Sahifa yuklash uchun
document.addEventListener('DOMContentLoaded', () => {
	const catalogList = document.querySelector('.catalog__list')
	const searchInput = document.querySelector('.header__search-input')
	const bagList = document.querySelector('.bag__list')
	const modal = document.createElement('div')
	modal.classList.add('modal')
	document.body.appendChild(modal)

	let books = []

	// books.json fetch qilish uchun
	fetch('./assets/data/books.json')
		.then(res => res.json())
		.then(data => {
			books = data
			renderBooks(books)
		})

	// Reytinglarni localStorageda saqlash
	function saveRatingsToStorage(ratings) {
		localStorage.setItem('bookRatings', JSON.stringify(ratings))
	}

	// Reytinglarni localStoragedan olish
	function loadRatingsFromStorage() {
		return JSON.parse(localStorage.getItem('bookRatings') || '{}')
	}

	// Kitoblarni render qilish uchun
	function renderBooks(bookArray) {
		const savedRatings = loadRatingsFromStorage()
		catalogList.innerHTML = ''
		bookArray.forEach(book => {
			// Agar reyting localStorageda bo‘lsa, uni yuklash
			if (savedRatings[book.title]) {
				book.rating = savedRatings[book.title]
			}
			const bookEl = document.createElement('div')
			bookEl.classList.add('book')

			// kitobni chizish uchun
			bookEl.innerHTML = `
				<div class="book__content">
					<div class="book__img-wrap" draggable="true">
						<img class="book__img" src="./assets/images/books-img/${
							book.imageLink
						}" alt="book">
						<div class="book__img-drag-overlay">
							<div class="book__img-drag-text">DRAG<br>TO<br>BAG</div>
						</div>
					</div>
					<div class="book__info">
						<h3 class="book__title">${book.title}</h3>
						<p class="book__author">${book.author}</p>
						<div class="book__rating">${generateStars(book.rating)}</div>
						<div class="book__price">
							<span class="price__caption">Price:</span>
							<span class="price__value">${book.price}</span>
						</div>
						<div class="book__btns">
							<button class="book__add-btn">Add to bag</button>
							<button class="book__show-btn">Show more</button>
						</div>
					</div>
				</div>
			`

			addBookEvents(bookEl, book)
			catalogList.appendChild(bookEl)
		})
	}

	// Yulduzchalarni chizish uchun
	function generateStars(rating) {
		let stars = ''
		for (let i = 1; i <= 5; i++) {
			stars += `<span class="star ${
				i <= rating ? 'active' : ''
			}" data-value="${i}">&#9733;</span>`
		}
		return `<div class="rating-stars" data-rating="${rating}">${stars}</div>`
	}

	function addBookEvents(bookEl, book) {
		const ratingStars = bookEl.querySelector('.rating-stars')
		const stars = bookEl.querySelectorAll('.star')
		const addToBagBtn = bookEl.querySelector('.book__add-btn')
		const showMoreBtn = bookEl.querySelector('.book__show-btn')
		const imgWrap = bookEl.querySelector('.book__img-wrap')

		// Yulduzchalariga hover bo'lganda ishlaydigan funksiya
		stars.forEach(star => {
			star.addEventListener('mouseover', () => {
				const value = +star.dataset.value
				stars.forEach(s => {
					s.classList.toggle('active', +s.dataset.value <= value)
				})
			})
		})

		ratingStars.addEventListener('mouseleave', () => {
			const currentRating = +ratingStars.dataset.rating
			stars.forEach(s => {
				s.classList.toggle('active', +s.dataset.value <= currentRating)
			})
		})

		// Reyting yulduzchasini bosganda saqlash
		stars.forEach(star => {
			star.addEventListener('click', () => {
				const newRating = +star.dataset.value
				book.rating = newRating
				ratingStars.dataset.rating = newRating
				bookEl.querySelector('.book__rating').innerHTML =
					generateStars(newRating)
				addBookEvents(bookEl, book)

				// Reytingni localStorage'ga saqlash
				const savedRatings = loadRatingsFromStorage()
				savedRatings[book.title] = newRating
				saveRatingsToStorage(savedRatings)
			})
		})

		// Cartga qo'shish uchun
		addToBagBtn.addEventListener('click', () => {
			addToBag(book)
		})

		// Modalni ochish uchun
		showMoreBtn.addEventListener('click', () => {
			modal.innerHTML = `
				<div class="modal__content">
					<h2 class="modal__title">${book.title}</h2>
					<p class="modal__description">${book.description}</p>
					<button class="modal__close" aria-label="Close modal">×</button>
				</div>
			`
			modal.classList.add('open')

			// Modalni yopish uchun
			const closeBtn = modal.querySelector('.modal__close')
			closeBtn.addEventListener('click', closeModal)

			// Modal tashqarisiga bosilganda yopish uchun
			modal.addEventListener('click', e => {
				if (e.target === modal) {
					closeModal()
				}
			})

			// Escape tugmasi bosilganda modalni yopish uchun
			document.addEventListener('keydown', e => {
				if (e.key === 'Escape' && modal.classList.contains('open')) {
					closeModal()
				}
			})
		})

		// Drag & Drop funksiyasi uchun rasmni draggabl qilish
		imgWrap.setAttribute('draggable', 'true')
		imgWrap.addEventListener('dragstart', e => {
			imgWrap.classList.add('dragging')
			e.dataTransfer.setData('text/plain', JSON.stringify(book))
			e.dataTransfer.effectAllowed = 'move'
		})
		imgWrap.addEventListener('dragend', () => {
			imgWrap.classList.remove('dragging')
		})
	}

	// Modal oynani yopish funksiyasi
	function closeModal() {
		modal.classList.remove('open')
		//  Eventni tozalash uchun
		const closeBtn = modal.querySelector('.modal__close')
		if (closeBtn) {
			closeBtn.removeEventListener('click', closeModal)
		}
		modal.removeEventListener('click', closeModal)
		document.removeEventListener('keydown', closeModal)
	}

	function saveBagToStorage() {
		const items = []
		bagList.querySelectorAll('.bag__item').forEach(item => {
			items.push({
				title: item.getAttribute('data-title'),
				author: item.querySelector('.bag__item-author').textContent,
				imageLink: item.querySelector('img').getAttribute('src'),
				price: +item
					.querySelector('.bag__item-price b')
					.textContent.replace('$', ''),
				quantity: +item.querySelector('.bag__quantity').textContent,
			})
		})
		localStorage.setItem('bagItems', JSON.stringify(items))
	}

	// Cartni localStoragedan yuklash uchun
	function loadBagFromStorage() {
		const items = JSON.parse(localStorage.getItem('bagItems') || '[]')
		bagList.innerHTML = ''
		items.forEach(item => {
			const book = {
				title: item.title,
				author: item.author,
				imageLink: item.imageLink.replace('./assets/images/books-img/', ''),
				price: item.price,
			}
			for (let i = 0; i < item.quantity; i++) {
				addToBag(book, true)
			}
		})
		updateTotal()
	}

	// Cartga kitob qo‘shish uchun localStorageda ham ishlaydigan funksiya
	function addToBag(book, fromStorage = false) {
		const existingItem = bagList.querySelector(`[data-title=\"${book.title}\"]`)
		if (existingItem) {
			const quantityEl = existingItem.querySelector('.bag__quantity')
			const currentQty = +quantityEl.textContent
			quantityEl.textContent = currentQty + 1
			updateTotal()
			if (!fromStorage) saveBagToStorage()
		} else {
			const item = document.createElement('div')
			item.classList.add('bag__item')
			item.setAttribute('data-title', book.title)
			item.innerHTML = `
				<img src="${
					book.imageLink.startsWith('./')
						? book.imageLink
						: './assets/images/books-img/' + book.imageLink
				}" alt="${book.title}">
				<h3 class="bag__item-title">${book.title}</h3>
				<p class="bag__item-author">${book.author}</p>
				<p class="bag__item-price">Price: <b>$${book.price}</b></p>
				<div class="bag__item-quantity">
					<button class="bag__quantity-btn bag__quantity-minus">-</button>
					<span class="bag__quantity">1</span>
					<button class="bag__quantity-btn bag__quantity-plus">+</button>
				</div>
				<button class="bag__remove-btn" aria-label="Remove item">×</button>
			`

			const removeBtn = item.querySelector('.bag__remove-btn')
			removeBtn.addEventListener('click', () => {
				item.remove()
				updateTotal()
				saveBagToStorage()
			})

			// Plus Minus buttonlar
			const minusBtn = item.querySelector('.bag__quantity-minus')
			const plusBtn = item.querySelector('.bag__quantity-plus')
			const quantityEl = item.querySelector('.bag__quantity')
			minusBtn.addEventListener('click', () => {
				let qty = +quantityEl.textContent
				if (qty > 1) {
					qty--
					quantityEl.textContent = qty
					updateTotal()
					saveBagToStorage()
				}
			})
			plusBtn.addEventListener('click', () => {
				let qty = +quantityEl.textContent
				qty++
				quantityEl.textContent = qty
				updateTotal()
				saveBagToStorage()
			})

			bagList.appendChild(item)
			updateTotal()
			if (!fromStorage) saveBagToStorage()
		}
	}

	// Total price ni hisoblash va localStorageda saqlash uchun
	function updateTotal() {
		const items = bagList.querySelectorAll('.bag__item')
		let total = 0

		items.forEach(item => {
			const price = +item
				.querySelector('.bag__item-price b')
				.textContent.replace('$', '')
			const quantity = +item.querySelector('.bag__quantity').textContent
			total += price * quantity
		})

		const totalEl = document.querySelector('.bag__total-value')
		if (totalEl) {
			totalEl.textContent = total.toFixed(2)
		}

		const confirmBtn = document.querySelector('.button__confirm-btn')
		if (confirmBtn) {
			confirmBtn.disabled = total === 0
		}
		saveBagToStorage()
	}

	window.addEventListener('DOMContentLoaded', () => {
		loadBagFromStorage()
	})

	// Kitob nomi va yozuvchisi bo'yicha qidirish uchun
	searchInput.addEventListener('input', () => {
		const term = searchInput.value.trim().toLowerCase()
		if (!term) {
			renderBooks(books)
			return
		}
		const filtered = books.filter(book => {
			return (
				book.title.toLowerCase().includes(term) ||
				book.author.toLowerCase().includes(term)
			)
		})
		renderBooks(filtered)
	})

	// Bagga rasmni drag & drop qilish uchun eventlar
	const bag = document.querySelector('.bag__content')
	bag.addEventListener('dragover', e => {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
		bag.classList.add('drag-over')
	})
	bag.addEventListener('dragleave', () => {
		bag.classList.remove('drag-over')
	})
	bag.addEventListener('drop', e => {
		e.preventDefault()
		bag.classList.remove('drag-over')
		try {
			const data = JSON.parse(e.dataTransfer.getData('text/plain'))
			if (data && data.title) {
				addToBag(data)
				// Toastify uchun
				const successMessage = document.createElement('div')
				successMessage.textContent = 'Added to bag!'
				successMessage.style.position = 'fixed'
				successMessage.style.top = '20px'
				successMessage.style.left = '50%'
				successMessage.style.transform = 'translateX(-50%)'
				successMessage.style.backgroundColor = '#4CAF50'
				successMessage.style.color = 'white'
				successMessage.style.padding = '10px 20px'
				successMessage.style.borderRadius = '5px'
				successMessage.style.zIndex = '1000'
				document.body.appendChild(successMessage)
				setTimeout(() => {
					successMessage.remove()
				}, 2000)
			}
		} catch (error) {
			console.error("Drag ma'lumotini o'qishda xatolik:", error)
		}
	})
})
