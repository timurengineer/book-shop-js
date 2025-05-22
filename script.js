document.addEventListener('DOMContentLoaded', () => {
	const catalogList = document.querySelector('.catalog__list')
	const searchInput = document.querySelector('.header__search-input')
	const bagList = document.querySelector('.bag__list')
	const modal = document.createElement('div')
	modal.classList.add('modal')
	document.body.appendChild(modal)

	let books = []

	// Load books.json
	fetch('./assets/data/books.json')
		.then(res => res.json())
		.then(data => {
			books = data
			renderBooks(books)
		})

	function renderBooks(bookArray) {
		catalogList.innerHTML = ''
		bookArray.forEach(book => {
			const bookEl = document.createElement('div')
			bookEl.classList.add('book')
			bookEl.setAttribute('draggable', 'true')

			bookEl.innerHTML = `
				<div class="book__content">
					<div class="book__img-wrap">
						<img class="book__img" src="./assets/images/books-img/${
							book.imageLink
						}" alt="book">
					</div>
					<h3 class="book__title">${book.title}</h3>
					<p class="book__author">${book.author}</p>
					<p class="book__price">$${book.price}</p>
					<div class="book__rating">${generateStars(book.rating)}</div>
					<div class="book__buttons">
						<button class="book__btn show-more">Show More</button>
						<button class="book__btn add-to-bag">Add to Bag</button>
					</div>
				</div>
			`

			addBookEvents(bookEl, book)
			catalogList.appendChild(bookEl)
		})
	}

	function generateStars(rating) {
		let stars = ''
		for (let i = 1; i <= 5; i++) {
			stars += `<span class="star ${
				i <= rating ? 'active' : ''
			}" data-value="${i}">&#9733;</span>`
		}
		return stars
	}

	function addBookEvents(bookEl, book) {
		const stars = bookEl.querySelectorAll('.star')
		const addToBagBtn = bookEl.querySelector('.add-to-bag')
		const showMoreBtn = bookEl.querySelector('.show-more')

		stars.forEach(star => {
			star.addEventListener('click', () => {
				book.rating = +star.dataset.value
				bookEl.querySelector('.book__rating').innerHTML = generateStars(
					book.rating
				)
				addBookEvents(bookEl, book) // rebind events
			})
		})

		addToBagBtn.addEventListener('click', () => {
			addToBag(book)
		})

		showMoreBtn.addEventListener('click', () => {
			modal.innerHTML = `
				<div class="modal__content">
					<h2 class="modal__title">${book.title}</h2>
					<p class="modal__description">${book.description}</p>
					<button class="modal__close" aria-label="Close modal">×</button>
				</div>
			`
			modal.classList.add('open')

			// Close button click handler
			const closeBtn = modal.querySelector('.modal__close')
			closeBtn.addEventListener('click', closeModal)

			// Click outside modal handler
			modal.addEventListener('click', e => {
				if (e.target === modal) {
					closeModal()
				}
			})

			// Escape key handler
			document.addEventListener('keydown', e => {
				if (e.key === 'Escape' && modal.classList.contains('open')) {
					closeModal()
				}
			})
		})

		// Drag & Drop
		bookEl.addEventListener('dragstart', e => {
			e.dataTransfer.setData('text/plain', JSON.stringify(book))
		})
	}

	function closeModal() {
		modal.classList.remove('open')
		// Remove event listeners
		const closeBtn = modal.querySelector('.modal__close')
		if (closeBtn) {
			closeBtn.removeEventListener('click', closeModal)
		}
		modal.removeEventListener('click', closeModal)
		document.removeEventListener('keydown', closeModal)
	}

	function addToBag(book) {
		const existingItem = bagList.querySelector(`[data-title="${book.title}"]`)
		if (existingItem) {
			const quantityEl = existingItem.querySelector('.bag__quantity')
			quantityEl.textContent = +quantityEl.textContent + 1
		} else {
			const item = document.createElement('div')
			item.classList.add('bag__item')
			item.setAttribute('data-title', book.title)
			item.innerHTML = `
				<p>${book.title} by ${book.author}</p>
				<p>$${book.price}</p>
				<p>Qty: <span class="bag__quantity">1</span></p>
			`
			bagList.appendChild(item)
		}
	}

	// Search filter
	searchInput.addEventListener('input', () => {
		const term = searchInput.value.toLowerCase()
		const filtered = books.filter(
			book =>
				book.title.toLowerCase().includes(term) ||
				book.author.toLowerCase().includes(term)
		)
		renderBooks(filtered)
	})

	// Allow drop into Bag
	const bag = document.querySelector('.bag__content')
	bag.addEventListener('dragover', e => {
		e.preventDefault()
	})
	bag.addEventListener('drop', e => {
		e.preventDefault()
		const data = JSON.parse(e.dataTransfer.getData('text/plain'))
		addToBag(data)
	})
})
