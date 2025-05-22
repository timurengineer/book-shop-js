const form = document.getElementById('orderForm')
const completeBtn = document.getElementById('completeBtn')
const modal = document.getElementById('orderModal')
const summary = document.getElementById('orderSummary')
const closeBtn = document.querySelector('.close')

// Har bir input uchun validatsiya qoidalari
const validators = {
	name: value => /^[A-Za-zА-Яа-яЁё]{4,}$/.test(value) && !/\s/.test(value),
	surname: value => /^[A-Za-zА-Яа-яЁё]{5,}$/.test(value) && !/\s/.test(value),
	date: value => {
		if (!value) return false
		const today = new Date()
		const inputDate = new Date(value)
		today.setDate(today.getDate() + 1)
		return inputDate >= today
	},
	street: value => /^.{5,}$/.test(value),
	house: value => /^[1-9]\d*$/.test(value),
	flat: value => /^([1-9]\d*|[1-9]\d*-\d+)$/.test(value),
	payment: () => {
		const checked = form.querySelector('input[name="payment"]:checked')
		return !!checked
	},
}

// Xatolik textlari
const errorMessages = {
	name: "Ism kamida 4 ta harfdan iborat bo'lishi va bo'sh joylarsiz bo'lishi kerak.",
	surname:
		"Familiya kamida 5 ta harfdan iborat bo'lishi va bo'sh joylarsiz bo'lishi kerak.",
	date: "Sanani to'g'ri kiriting (ertadan boshlab).",
	street: "Ko'cha nomi kamida 5 ta belgidan iborat bo'lishi kerak.",
	house: "Uy raqami faqat musbat butun son bo'lishi kerak.",
	flat: "Xonadon raqami musbat son yoki masalan, 1-37 ko'rinishida bo'lishi mumkin.",
	payment: "To'lov turini tanlang.",
}

// Inputlarni tekshirish va xatoliklarni ko'rsatish uchun
function validateField(field) {
	let input
	let errorSpan

	if (field === 'payment') {
		input = null
		errorSpan = form.querySelector('.radio-group').nextElementSibling
	} else {
		input = form.elements[field]
		errorSpan = input.nextElementSibling
	}

	let valid = false
	if (field === 'payment') {
		valid = validators[field]()
	} else {
		valid = validators[field](input.value.trim())
	}

	if (!valid) {
		if (input) input.classList.add('invalid')
		errorSpan.textContent = errorMessages[field]
		errorSpan.style.display = 'block'
	} else {
		if (input) input.classList.remove('invalid')
		errorSpan.textContent = ''
		errorSpan.style.display = 'none'
	}
	return valid
}

// Required fieldlarni tekshirish uchun
function validateForm() {
	let isValid = true
	for (let field in validators) {
		if (!validateField(field)) isValid = false
	}
	completeBtn.disabled = !isValid
	return isValid
}

// Inputlar uchun eventlar
;['name', 'surname', 'date', 'street', 'house', 'flat'].forEach(field => {
	const input = form.elements[field]
	if (input) {
		input.addEventListener('input', () => {
			validateField(field)
			validateForm()
		})
		input.addEventListener('blur', () => {
			validateField(field)
			validateForm()
		})
	}
})

// Radio uchun
form.querySelectorAll('input[name="payment"]').forEach(radio => {
	radio.addEventListener('change', () => {
		validateField('payment')
		validateForm()
	})
})

// Modal oynani yopish va index.html ga o'tish
closeBtn.onclick = function () {
	modal.style.display = 'none'
	// Savatchani bo'shatish
	localStorage.removeItem('bagItems')
	window.location.href = '../index.html'
}

window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = 'none'
		// Savatchani bo'shatish
		localStorage.removeItem('bagItems')
		window.location.href = '../index.html'
	}
}

// Formani yuborish uchun
form.addEventListener('submit', function (e) {
	e.preventDefault()
	if (!validateForm()) return

	// Ma'lumotlarni yig'ish uchun
	const name = form.elements['name'].value.trim()
	const surname = form.elements['surname'].value.trim()
	const date = form.elements['date'].value
	const street = form.elements['street'].value.trim()
	const house = form.elements['house'].value.trim()
	const flat = form.elements['flat'].value.trim()
	const payment = form.querySelector('input[name="payment"]:checked').value
	const gifts = Array.from(
		form.querySelectorAll('input[name="gifts"]:checked')
	).map(cb => cb.value)

	// Buyurtma yaratish xabari
	let msg = `Buyurtma yaratildi!<br>Yetkazib berish manzili: <b>${street}</b> ko'chasi, <b>${house}</b>-uy, <b>${flat}</b>-xonadon.<br>Mijoz: <b>${name} ${surname}</b>.<br>To'lov turi: <b>${payment}</b>.<br>Yetkazib berish sanasi: <b>${date}</b>.`
	if (gifts.length) {
		msg += `<br>Siz tanlagan sovg'alar: <b>${gifts.join(', ')}</b>.`
	}

	// Modal oynani ko'rsatish
	summary.innerHTML = msg
	modal.style.display = 'block'

	// Formani tozalash
	form.reset()
	completeBtn.disabled = true
})
