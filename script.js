// =========================================================
// 1. HTML-ELEMENTE REFERENZIEREN
// =========================================================
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

const btnLangDE = document.getElementById('btnLangDE');
const btnLangEN = document.getElementById('btnLangEN');

const searchType = document.getElementById('searchType');
const groupName = document.getElementById('groupName');
const groupIngredient = document.getElementById('groupIngredient');
const groupAlcohol = document.getElementById('groupAlcohol');
const alcoholFilter = document.getElementById('alcoholFilter');

const inputName = document.getElementById('inputName');
const inputIngredient = document.getElementById('inputIngredient');
const feedbackText = document.getElementById('feedbackText');

const filterResultsInput = document.getElementById('filterResultsInput');
const resultsSelect = document.getElementById('resultsSelect');
const resultsCountLabel = document.getElementById('resultsCountLabel');
const recipeResult = document.getElementById('recipeResult');

const btnStep1 = document.getElementById('btnStep1');
const btnStep2 = document.getElementById('btnStep2');
const btnBackTo1 = document.getElementById('btnBackTo1');
const btnBackTo2 = document.getElementById('btnBackTo2');

// Globale Variablen
let currentLang = 'de';
let allFetchedDrinks = [];
let currentDisplayedDrink = null;
let cameFromRandom = false;


// =========================================================
// 2. SPRACHUMSCHALTUNG (DE / EN) - IMMER VERFÜGBAR
// =========================================================
const translations = {
  de: {
    step1Title: 'Schritt 1: Suche',
    labelSearchType: 'Suchen nach:',
    optName: 'Cocktailname',
    optIngredient: 'Hauptzutat',
    optRandom: '🎲 Random Cocktail',
    labelName: 'Name:',
    labelIngredient: 'Zutat:',
    hintText: 'Buchstaben und Zahlen sind gültig (2–30 Zeichen).',
    labelAlcohol: 'Alkoholgehalt:',
    optAll: 'Alle anzeigen',
    optAlcoholic: 'Mit Alkohol',
    optNonAlcoholic: 'Alkoholfrei',
    btnNext: 'Weiter',
    step2Title: 'Schritt 2: Cocktail auswählen',
    labelFilterResults: 'Liste durchsuchen:',
    filterPlaceholder: 'Name tippen zum Filtern...',
    selectDefault: '-- Bitte Cocktail wählen --',
    btnBack: 'Zurück',
    btnShowRecipe: 'Rezept anzeigen',
    step3Title: 'Schritt 3: Rezept',
    glassTitle: '🥃 Benötigtes Glas:',
    ingredientsTitle: '🍋 Zutaten:',
    instructionsTitle: '📋 Zubereitung:'
  },
  en: {
    step1Title: 'Step 1: Search',
    labelSearchType: 'Search by:',
    optName: 'Cocktail Name',
    optIngredient: 'Main Ingredient',
    optRandom: '🎲 Random Cocktail',
    labelName: 'Name:',
    labelIngredient: 'Ingredient:',
    hintText: 'Letters and numbers are valid (2–30 characters).',
    labelAlcohol: 'Alcohol content:',
    optAll: 'Show all',
    optAlcoholic: 'Alcoholic',
    optNonAlcoholic: 'Non-Alcoholic',
    btnNext: 'Next',
    step2Title: 'Step 2: Choose Cocktail',
    labelFilterResults: 'Filter list:',
    filterPlaceholder: 'Type name to filter...',
    selectDefault: '-- Please select a cocktail --',
    btnBack: 'Back',
    btnShowRecipe: 'Show Recipe',
    step3Title: 'Step 3: Recipe',
    glassTitle: '🥃 Required Glass:',
    ingredientsTitle: '🍋 Ingredients:',
    instructionsTitle: '📋 Instructions:'
  }
};

function setLanguage(lang) {
  currentLang = lang;

  // Aktiven Button markieren
  btnLangDE.classList.toggle('active', lang === 'de');
  btnLangEN.classList.toggle('active', lang === 'en');

  // Alle Texte auf der Seite übersetzen
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  filterResultsInput.placeholder = translations[lang].filterPlaceholder;
  if (allFetchedDrinks.length > 0) {
    updateResultsDropdown(allFetchedDrinks);
  }

  // Rezept in Schritt 3 sofort in neuer Sprache anzeigen, falls wir uns dort befinden
  if (!step3.classList.contains('hidden') && currentDisplayedDrink) {
    renderRecipe(currentDisplayedDrink);
  }
}

btnLangDE.addEventListener('click', () => setLanguage('de'));
btnLangEN.addEventListener('click', () => setLanguage('en'));

// Übersetzt englische Texte (Glas, Zutaten, Anleitung) live ins Deutsche
async function translateToGerman(text) {
  if (!text || text.trim() === '') return '';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|de`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch (e) {
    return text;
  }
}


// =========================================================
// 3. REGULÄRE AUSDRÜCKE & VALIDIERUNG (E2)
// =========================================================
const regexInput = /^[a-zA-Z0-9äöüÄÖÜßàáâèéê\s-]{2,30}$/;

searchType.addEventListener('change', () => {
  const mode = searchType.value;

  if (mode === 'name') {
    groupName.classList.remove('hidden');
    groupIngredient.classList.add('hidden');
    groupAlcohol.classList.remove('hidden');
  } else if (mode === 'ingredient') {
    groupIngredient.classList.remove('hidden');
    groupName.classList.add('hidden');
    groupAlcohol.classList.remove('hidden');
  } else if (mode === 'random') {
    groupName.classList.add('hidden');
    groupIngredient.classList.add('hidden');
    groupAlcohol.classList.add('hidden');
  }
  resetValidation();
});

inputName.addEventListener('input', () => validate(inputName));
inputIngredient.addEventListener('input', () => validate(inputIngredient));

function validate(inputField) {
  const text = inputField.value.trim();

  if (text.length === 0) {
    inputField.className = '';
    inputField.setAttribute('aria-invalid', 'false');
    feedbackText.textContent = '';
    feedbackText.className = '';
    return false;
  }

  if (text.length < 2 || text.length > 30) {
    inputField.className = 'invalid';
    inputField.setAttribute('aria-invalid', 'true');
    feedbackText.textContent = currentLang === 'de' 
      ? '❌ Eingabe muss zwischen 2 und 30 Zeichen lang sein.' 
      : '❌ Input must be between 2 and 30 characters.';
    feedbackText.className = 'text-error';
    return false;
  }

  if (!regexInput.test(text)) {
    inputField.className = 'invalid';
    inputField.setAttribute('aria-invalid', 'true');
    feedbackText.textContent = currentLang === 'de' 
      ? '❌ Nur Buchstaben und Zahlen sind gültig.' 
      : '❌ Only letters and numbers are valid.';
    feedbackText.className = 'text-error';
    return false;
  }

  inputField.className = 'valid';
  inputField.setAttribute('aria-invalid', 'false');
  feedbackText.textContent = currentLang === 'de' ? '✓ Eingabe gültig' : '✓ Valid input';
  feedbackText.className = 'text-success';
  return true;
}

function resetValidation() {
  inputName.value = '';
  inputIngredient.value = '';
  inputName.className = '';
  inputIngredient.className = '';
  inputName.setAttribute('aria-invalid', 'false');
  inputIngredient.setAttribute('aria-invalid', 'false');
  feedbackText.textContent = '';
  feedbackText.className = '';
}


// =========================================================
// 4. SCHRITT 1 -> SCHRITT 2 (INKL. INTELLIGENTER ZUTATENSUCHE)
// =========================================================
btnStep1.addEventListener('click', async () => {
  const mode = searchType.value;

  // --- FALL A: RANDOM COCKTAIL ---
  if (mode === 'random') {
    try {
      const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
      const data = await response.json();
      const randomDrink = data.drinks[0];

      cameFromRandom = true;
      step1.classList.add('hidden');
      step3.classList.remove('hidden');
      await renderRecipe(randomDrink);
    } catch (error) {
      feedbackText.textContent = '❌ Fehler beim Laden des Zufalls-Cocktails.';
      feedbackText.className = 'text-error';
    }
    return;
  }

  // --- FALL B: SUCHE NACH NAME ODER HAUPTZUTAT ---
  cameFromRandom = false;
  const isNameMode = mode === 'name';
  const currentInput = isNameMode ? inputName : inputIngredient;
  const searchCategory = isNameMode ? 'Cocktail' : 'Zutat';

  if (!validate(currentInput)) return;

  const query = currentInput.value.trim();
  const selectedAlcohol = alcoholFilter.value;

  try {
    let drinks = [];

    if (isNameMode) {
      // 1) SUCHE NACH COCKTAILNAME
      const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.drinks && Array.isArray(data.drinks)) {
        drinks = data.drinks;
      }
    } else {
      // 2) SUCHE NACH HAUPTZUTAT (Behebt das "Rum"-Problem!)
      // Wir holen zuerst die Liste aller Zutaten der API (list.php?i=list)
      const listRes = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list');
      const listData = await listRes.json();

      // Alle passenden Sorten finden (z.B. bei "Rum" -> "Light rum", "Dark rum", "White rum", "Rum" etc.)
      const matchingIngredients = listData.drinks
        .map(item => item.strIngredient1)
        .filter(ing => ing.toLowerCase().includes(query.toLowerCase()));

      // Falls keine passende Zutat gefunden wurde, trotzdem direkten Suchbegriff probieren
      const ingredientsToFetch = matchingIngredients.length > 0 ? matchingIngredients : [query];

      // Alle passenden Zutaten-Sorten parallel bei der API abfragen
      const requests = ingredientsToFetch.map(ing =>
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`)
          .then(res => res.json())
          .catch(() => ({ drinks: null }))
      );

      const results = await Promise.all(requests);

      // Alle gefundenen Cocktails zusammenführen und Duplikate über eine Map entfernen
      const uniqueDrinksMap = new Map();
      results.forEach(res => {
        if (res.drinks && Array.isArray(res.drinks)) {
          res.drinks.forEach(drink => {
            uniqueDrinksMap.set(drink.idDrink, drink);
          });
        }
      });

      drinks = Array.from(uniqueDrinksMap.values());
    }

    // Wenn gar nichts gefunden wurde -> Fehlermeldung
    if (drinks.length === 0) {
      feedbackText.textContent = `❌ ${searchCategory} existiert nicht.`;
      feedbackText.className = 'text-error';
      currentInput.className = 'invalid';
      currentInput.setAttribute('aria-invalid', 'true');
      return;
    }

    // Alkohol-Filter anwenden
    if (selectedAlcohol !== 'all') {
      if (isNameMode) {
        drinks = drinks.filter(d => d.strAlcoholic === (selectedAlcohol === 'Alcoholic' ? 'Alcoholic' : 'Non alcoholic'));
      } else {
        const alcRes = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${selectedAlcohol}`);
        const alcData = await alcRes.json();
        const allowedIds = new Set(alcData.drinks.map(d => d.idDrink));
        drinks = drinks.filter(d => allowedIds.has(d.idDrink));
      }
    }

    if (drinks.length === 0) {
      feedbackText.textContent = currentLang === 'de' 
        ? '❌ Keine Cocktails mit diesem Filter gefunden.' 
        : '❌ No cocktails found with this filter.';
      feedbackText.className = 'text-error';
      return;
    }

    // Alphabetisch sortieren (A - Z) für Kompetenz E4
    drinks.sort((a, b) => a.strDrink.localeCompare(b.strDrink));

    // Alle gefundenen Cocktails speichern und Dropdown befüllen
    allFetchedDrinks = drinks;
    filterResultsInput.value = '';
    updateResultsDropdown(allFetchedDrinks);

    step1.classList.add('hidden');
    step2.classList.remove('hidden');

  } catch (error) {
    feedbackText.textContent = '❌ Fehler beim Abfragen der Daten.';
    feedbackText.className = 'text-error';
  }
});


// =========================================================
// 5. SCHRITT 2: ALLE COCKTAILS IM DROPDOWN & LIVE-FILTER
// =========================================================
function updateResultsDropdown(drinksList) {
  resultsSelect.innerHTML = `<option value="">${translations[currentLang].selectDefault}</option>`;

  resultsCountLabel.textContent = currentLang === 'de'
    ? `Ergebnisliste (${drinksList.length} Cocktails gefunden):`
    : `Results (${drinksList.length} cocktails found):`;

  drinksList.forEach(drink => {
    const option = document.createElement('option');
    option.value = drink.idDrink;
    option.textContent = drink.strDrink;
    resultsSelect.appendChild(option);
  });
}

filterResultsInput.addEventListener('input', () => {
  const searchTerm = filterResultsInput.value.toLowerCase().trim();
  const filtered = allFetchedDrinks.filter(drink => 
    drink.strDrink.toLowerCase().includes(searchTerm)
  );
  updateResultsDropdown(filtered);
});


// =========================================================
// 6. SCHRITT 2 -> SCHRITT 3 (REZEPT MIT ÜBERSETZUNG)
// =========================================================
btnStep2.addEventListener('click', async () => {
  const drinkId = resultsSelect.value;

  if (!drinkId) {
    alert(currentLang === 'de' ? 'Bitte wähle einen Cocktail aus.' : 'Please select a cocktail.');
    return;
  }

  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`);
    const data = await response.json();
    const drink = data.drinks[0];

    step2.classList.add('hidden');
    step3.classList.remove('hidden');
    await renderRecipe(drink);
  } catch (error) {
    alert('Fehler beim Laden des Rezepts.');
  }
});

// Baut das Rezept zusammen (Glas -> Zutaten -> Fließtext-Anleitung)
async function renderRecipe(drink) {
  currentDisplayedDrink = drink;

  if (currentLang === 'de') {
    recipeResult.innerHTML = '<p>Rezept wird geladen und übersetzt...</p>';
  }

  // 1. ZUTATEN & MENGEN AUSLESEN (1 bis 15)
  let rawIngredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== '') {
      const amount = measure ? measure.trim() : '';
      rawIngredients.push({ amount, name: ingredient.trim() });
    }
  }

  // 2. GLAS & ANLEITUNG VORBEREITEN
  let glassText = drink.strGlass || 'Standard';
  let instructionText = drink.strInstructions || '';

  // Wenn Deutsch aktiv ist: Glas, Anleitung und Zutaten ins Deutsche übersetzen
  if (currentLang === 'de') {
    glassText = await translateToGerman(glassText);

    if (drink.strInstructionsDE && drink.strInstructionsDE.trim() !== '') {
      instructionText = drink.strInstructionsDE;
    } else {
      instructionText = await translateToGerman(instructionText);
    }

    if (rawIngredients.length > 0) {
      const namesJoined = rawIngredients.map(item => item.name).join(' | ');
      const translatedJoined = await translateToGerman(namesJoined);
      const translatedNames = translatedJoined.split('|').map(s => s.trim());

      rawIngredients.forEach((item, index) => {
        if (translatedNames[index]) {
          item.name = translatedNames[index];
        }
      });
    }
  }

  const ingredientsHTML = rawIngredients
    .map(item => `<li><strong>${item.amount}</strong> ${item.name}</li>`)
    .join('');

  // 3. ALLES IN SCHRITT 3 ANZEIGEN (Zuerst Glas, dann Zutaten, dann Fließtext-Anleitung)
  recipeResult.innerHTML = `
    <div class="recipe-card">
      <h3>${drink.strDrink}</h3>
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">

      <div class="glass-info">
        ${translations[currentLang].glassTitle} ${glassText}
      </div>

      <h4>${translations[currentLang].ingredientsTitle}</h4>
      <ul class="ingredients-list">
        ${ingredientsHTML}
      </ul>

      <h4>${translations[currentLang].instructionsTitle}</h4>
      <p class="instruction-text">${instructionText}</p>
    </div>
  `;
}


// =========================================================
// 7. ZURÜCK-BUTTONS
// =========================================================
btnBackTo1.addEventListener('click', () => {
  step2.classList.add('hidden');
  step1.classList.remove('hidden');
});

btnBackTo2.addEventListener('click', () => {
  step3.classList.add('hidden');
  if (cameFromRandom) {
    step1.classList.remove('hidden');
  } else {
    step2.classList.remove('hidden');
  }
});