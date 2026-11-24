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

const resultsSelect = document.getElementById('resultsSelect');
const resultsCountLabel = document.getElementById('resultsCountLabel');
const recipeResult = document.getElementById('recipeResult');

const btnStep1 = document.getElementById('btnStep1');
const btnStep2 = document.getElementById('btnStep2');
const btnBackTo1 = document.getElementById('btnBackTo1');
const btnBackTo2 = document.getElementById('btnBackTo2');

const normalStep3Buttons = document.getElementById('normalStep3Buttons');
const randomStep3Buttons = document.getElementById('randomStep3Buttons');
const btnAnotherRandom = document.getElementById('btnAnotherRandom');
const btnBackToStartFromRandom = document.getElementById('btnBackToStartFromRandom');

// Globale Variablen
let currentLang = 'de';
let allFetchedDrinks = [];
let currentDisplayedDrink = null;
let cachedFullDatabase = null; // Speichert alle Cocktails der API einmalig für blitzschnelle Zutatensuche


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
    selectDefault: '-- Bitte Cocktail wählen --',
    btnBack: 'Zurück',
    btnShowRecipe: 'Rezept anzeigen',
    step3Title: 'Schritt 3: Rezept',
    glassTitle: 'Benötigtes Glas:',
    ingredientsTitle: 'Zutaten:',
    instructionsTitle: 'Schritt-für-Schritt Anleitung:',
    btnAnotherRandom: '🎲 Anderer Cocktail',
    btnNewSearch: 'Neue Suche'
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
    selectDefault: '-- Please select a cocktail --',
    btnBack: 'Back',
    btnShowRecipe: 'Show Recipe',
    step3Title: 'Step 3: Recipe',
    glassTitle: 'Required Glass:',
    ingredientsTitle: 'Ingredients:',
    instructionsTitle: 'Step-by-Step Instructions:',
    btnAnotherRandom: '🎲 Another Cocktail',
    btnNewSearch: 'New Search'
  }
};

function setLanguage(lang) {
  currentLang = lang;

  btnLangDE.classList.toggle('active', lang === 'de');
  btnLangEN.classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  if (allFetchedDrinks.length > 0) {
    updateResultsDropdown(allFetchedDrinks);
  }

  if (!step3.classList.contains('hidden') && currentDisplayedDrink) {
    renderRecipe(currentDisplayedDrink);
  }
}

btnLangDE.addEventListener('click', () => setLanguage('de'));
btnLangEN.addEventListener('click', () => setLanguage('en'));

// Übersetzt Texte zwischen DE und EN
async function translateText(text, langPair) {
  if (!text || text.trim() === '') return '';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`);
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
// 4. HILFSFUNKTION: KOMPLETTE DATENBANK LADEN (FÜR ZUTATEN)
// =========================================================
async function getAllCocktailsFromAPI() {
  if (cachedFullDatabase) return cachedFullDatabase;

  // Alle Buchstaben a-z und Ziffern 1-9 parallel abrufen, damit KEIN Cocktail übersehen wird
  const chars = 'abcdefghijklmnopqrstuvwxyz123456789'.split('');
  const requests = chars.map(char =>
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${char}`)
      .then(res => res.json())
      .catch(() => ({ drinks: null }))
  );

  const results = await Promise.all(requests);
  const allDrinks = [];

  results.forEach(res => {
    if (res.drinks && Array.isArray(res.drinks)) {
      allDrinks.push(...res.drinks);
    }
  });

  cachedFullDatabase = allDrinks;
  return allDrinks;
}


// =========================================================
// 5. RANDOM COCKTAIL FUNKTION
// =========================================================
async function loadRandomCocktail() {
  try {
    const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
    const data = await response.json();
    const randomDrink = data.drinks[0];

    normalStep3Buttons.classList.add('hidden');
    randomStep3Buttons.classList.remove('hidden');

    step1.classList.add('hidden');
    step3.classList.remove('hidden');
    await renderRecipe(randomDrink);
  } catch (error) {
    feedbackText.textContent = '❌ Fehler beim Laden des Zufalls-Cocktails.';
    feedbackText.className = 'text-error';
  }
}

btnAnotherRandom.addEventListener('click', loadRandomCocktail);


// =========================================================
// 6. SCHRITT 1 -> SCHRITT 2 (SUCHE NACH NAME ODER HAUPTZUTAT)
// =========================================================
btnStep1.addEventListener('click', async () => {
  const mode = searchType.value;

  if (mode === 'random') {
    await loadRandomCocktail();
    return;
  }

  normalStep3Buttons.classList.remove('hidden');
  randomStep3Buttons.classList.add('hidden');

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
      // 2) SUCHE NACH HAUPTZUTAT (Durchsucht ALLE Cocktails in allen Zutatenfeldern 1-15!)
      feedbackText.textContent = currentLang === 'de' ? '⏳ Durchsuche alle Rezepte...' : '⏳ Searching all recipes...';
      feedbackText.className = '';

      const allDrinks = await getAllCocktailsFromAPI();
      const searchLower = query.toLowerCase();

      // Falls auf Deutsch gesucht wird (z.B. "Wein" oder "Zitrone"), übersetzen wir das Suchwort zusätzlich ins Englische
      let searchEnglishLower = searchLower;
      if (currentLang === 'de') {
        const translatedQuery = await translateText(query, 'de|en');
        searchEnglishLower = translatedQuery.toLowerCase().trim();
      }

      // Alle Cocktails herausfiltern, bei denen die Zutat in strIngredient1 bis strIngredient15 vorkommt
      drinks = allDrinks.filter(drink => {
        for (let i = 1; i <= 15; i++) {
          const ing = drink[`strIngredient${i}`];
          if (ing) {
            const ingLower = ing.toLowerCase();
            if (ingLower.includes(searchLower) || ingLower.includes(searchEnglishLower)) {
              return true;
            }
          }
        }
        return false;
      });
    }

    if (drinks.length === 0) {
      feedbackText.textContent = `❌ ${searchCategory} existiert nicht.`;
      feedbackText.className = 'text-error';
      currentInput.className = 'invalid';
      currentInput.setAttribute('aria-invalid', 'true');
      return;
    }

    // Alkohol-Filter anwenden
    if (selectedAlcohol !== 'all') {
      const targetAlcohol = selectedAlcohol === 'Alcoholic' ? 'Alcoholic' : 'Non alcoholic';
      drinks = drinks.filter(d => d.strAlcoholic === targetAlcohol);
    }

    if (drinks.length === 0) {
      feedbackText.textContent = currentLang === 'de' 
        ? '❌ Keine Cocktails mit diesem Filter gefunden.' 
        : '❌ No cocktails found with this filter.';
      feedbackText.className = 'text-error';
      return;
    }

    // Feedback-Text wieder leeren
    feedbackText.textContent = '';

    // Alphabetisch sortieren (A - Z) für Kompetenz E4
    drinks.sort((a, b) => a.strDrink.localeCompare(b.strDrink));

    // Alle gefundenen Cocktails speichern und ins Dropdown füllen
    allFetchedDrinks = drinks;
    updateResultsDropdown(allFetchedDrinks);

    step1.classList.add('hidden');
    step2.classList.remove('hidden');

  } catch (error) {
    feedbackText.textContent = '❌ Fehler beim Abfragen der Daten.';
    feedbackText.className = 'text-error';
  }
});


// =========================================================
// 7. SCHRITT 2: ALLE COCKTAILS IM DROPDOWN ANZEIGEN
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


// =========================================================
// 8. SCHRITT 2 -> SCHRITT 3 (REZEPT MIT ÜBERSETZUNG & NUMMERIERUNG)
// =========================================================
btnStep2.addEventListener('click', async () => {
  const drinkId = resultsSelect.value;

  if (!drinkId) {
    alert(currentLang === 'de' ? 'Bitte wähle einen Cocktail aus.' : 'Please select a cocktail.');
    return;
  }

  try {
    // Falls wir den Cocktail schon komplett im Speicher haben, direkt nehmen, sonst per lookup.php laden
    let drink = allFetchedDrinks.find(d => d.idDrink === drinkId);
    if (!drink || !drink.strInstructions) {
      const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`);
      const data = await response.json();
      drink = data.drinks[0];
    }

    step2.classList.add('hidden');
    step3.classList.remove('hidden');
    await renderRecipe(drink);
  } catch (error) {
    alert('Fehler beim Laden des Rezepts.');
  }
});

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

  // 2. GLAS, MENGEN, ZUTATEN & ANLEITUNG VORBEREITEN
  let glassText = drink.strGlass || 'Standard';
  let instructionText = drink.strInstructions || '';

  if (currentLang === 'de') {
    glassText = await translateText(glassText, 'en|de');

    if (drink.strInstructionsDE && drink.strInstructionsDE.trim() !== '') {
      instructionText = drink.strInstructionsDE;
    } else {
      instructionText = await translateText(instructionText, 'en|de');
    }

    if (rawIngredients.length > 0) {
      const amountsToTranslate = rawIngredients.map(item => item.amount || '-').join(' | ');
      const translatedAmountsRaw = await translateText(amountsToTranslate, 'en|de');
      const translatedAmounts = translatedAmountsRaw.split('|').map(s => s.trim());

      const namesToTranslate = rawIngredients.map(item => item.name).join(' | ');
      const translatedNamesRaw = await translateText(namesToTranslate, 'en|de');
      const translatedNames = translatedNamesRaw.split('|').map(s => s.trim());

      rawIngredients.forEach((item, index) => {
        if (translatedAmounts[index] && translatedAmounts[index] !== '-') {
          item.amount = translatedAmounts[index];
        }
        if (translatedNames[index]) {
          item.name = translatedNames[index];
        }
      });
    }
  }

  const ingredientsHTML = rawIngredients
    .map(item => `<li><strong>${item.amount}</strong> ${item.name}</li>`)
    .join('');

  // 3. ANLEITUNG IN NUMMERIERTE SCHRITTE AUFSPLITTEN
  const stepsArray = instructionText
    .split('.')
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);

  const stepsListHTML = stepsArray
    .map(step => `<li>${step}.</li>`)
    .join('');

  // 4. ALLES IN SCHRITT 3 ANZEIGEN
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
      <ol class="instruction-list">
        ${stepsListHTML}
      </ol>
    </div>
  `;
}


// =========================================================
// 9. ZURÜCK-BUTTONS
// =========================================================
btnBackTo1.addEventListener('click', () => {
  step2.classList.add('hidden');
  step1.classList.remove('hidden');
});

btnBackTo2.addEventListener('click', () => {
  step3.classList.add('hidden');
  step2.classList.remove('hidden');
});

btnBackToStartFromRandom.addEventListener('click', () => {
  step3.classList.add('hidden');
  step1.classList.remove('hidden');
});