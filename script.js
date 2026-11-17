// =========================================================
// 1. HTML-ELEMENTE REFERENZIEREN
// =========================================================
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

const btnLang = document.getElementById('btnLang');
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

// Globale Variablen für Sprache & alle geladenen Cocktails
let currentLang = 'de';
let allFetchedDrinks = [];
let cameFromRandom = false; // Merkt sich, ob wir direkt von Random zu Schritt 3 gesprungen sind


// =========================================================
// 2. SPRACHUMSCHALTUNG (DE / EN)
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
    btnBack: 'Zurück',
    btnShowRecipe: 'Rezept anzeigen',
    step3Title: 'Schritt 3: Rezept',
    glassTitle: '🥃 Benötigtes Glas:',
    ingredientsTitle: '🍋 Zutaten:',
    instructionsTitle: '📋 Schritt-für-Schritt Anleitung:'
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
    btnBack: 'Back',
    btnShowRecipe: 'Show Recipe',
    step3Title: 'Step 3: Recipe',
    glassTitle: '🥃 Required Glass:',
    ingredientsTitle: '🍋 Ingredients:',
    instructionsTitle: '📋 Step-by-Step Instructions:'
  }
};

// Klick auf den Sprach-Button wechselt zwischen DE und EN
btnLang.addEventListener('click', () => {
  currentLang = currentLang === 'de' ? 'en' : 'de';
  btnLang.textContent = currentLang === 'de' ? '🌐 DE' : '🌐 EN';

  // Alle Elemente mit data-i18n Attribut aktualisieren
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
});


// =========================================================
// 3. REGULÄRE AUSDRÜCKE & VALIDIERUNG (E2)
// =========================================================
const regexInput = /^[a-zA-Z0-9äöüÄÖÜßàáâèéê\s-]{2,30}$/;

// Dynamisches Ein-/Ausblenden je nach Suchart (Name, Zutat oder Random)
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
    // Bei Random verschwinden Eingabefelder & Alkohol-Filter
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
// 4. SCHRITT 1 -> SCHRITT 2 (ODER DIREKT SCHRITT 3 BEI RANDOM)
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
      renderRecipe(randomDrink); // Direkt Rezept in Schritt 3 anzeigen
      step1.classList.add('hidden');
      step3.classList.remove('hidden');
    } catch (error) {
      feedbackText.textContent = '❌ Fehler beim Laden des Zufalls-Cocktails.';
      feedbackText.className = 'text-error';
    }
    return;
  }

  // --- FALL B: SUCHE NACH NAME ODER ZUTAT ---
  cameFromRandom = false;
  const isNameMode = mode === 'name';
  const currentInput = isNameMode ? inputName : inputIngredient;
  const searchCategory = isNameMode ? 'Cocktail' : 'Zutat';

  // Validierung prüfen
  if (!validate(currentInput)) return;

  const query = currentInput.value.trim();
  const selectedAlcohol = alcoholFilter.value; // 'all', 'Alcoholic' oder 'Non_Alcoholic'

  const url = isNameMode
    ? `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    : `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.drinks) {
      feedbackText.textContent = `❌ ${searchCategory} existiert nicht.`;
      feedbackText.className = 'text-error';
      currentInput.className = 'invalid';
      currentInput.setAttribute('aria-invalid', 'true');
      return;
    }

    let drinks = data.drinks;

    // --- ALKOHOL-FILTER ANWENDEN ---
    if (selectedAlcohol !== 'all') {
      if (isNameMode) {
        // Bei Namenssuche liefert die API bereits das Feld 'strAlcoholic' mit
        drinks = drinks.filter(d => d.strAlcoholic === (selectedAlcohol === 'Alcoholic' ? 'Alcoholic' : 'Non alcoholic'));
      } else {
        // Bei Zutatensuche holen wir die Alkohol-Liste über die angegebene Filter-API und gleichen die IDs ab
        const alcRes = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${selectedAlcohol}`);
        const alcData = await alcRes.json();
        const allowedIds = new Set(alcData.drinks.map(d => d.idDrink));
        drinks = drinks.filter(d => allowedIds.has(d.idDrink));
      }
    }

    // Prüfen, ob nach dem Filtern noch Cocktails übrig sind
    if (drinks.length === 0) {
      feedbackText.textContent = currentLang === 'de' 
        ? '❌ Keine Cocktails mit diesem Alkohol-Filter gefunden.' 
        : '❌ No cocktails found with this alcohol filter.';
      feedbackText.className = 'text-error';
      return;
    }

    // --- KOMPETENZ E4: DATEN ALPHABETISCH SORTIEREN (A - Z) ---
    drinks.sort((a, b) => a.strDrink.localeCompare(b.strDrink));

    // Alle gefundenen Cocktails speichern und Dropdown befüllen
    allFetchedDrinks = drinks;
    filterResultsInput.value = '';
    updateResultsDropdown(allFetchedDrinks);

    // Weiter zu Schritt 2
    step1.classList.add('hidden');
    step2.classList.remove('hidden');

  } catch (error) {
    feedbackText.textContent = '❌ Fehler beim Abfragen der Daten.';
    feedbackText.className = 'text-error';
  }
});


// =========================================================
// 5. SCHRITT 2: ALLE ERGEBNISSE ANZEIGEN & LIVE FILTERN
// =========================================================

// Befüllt das Dropdown mit allen übergebenen Cocktails (ohne 20er Limit)
function updateResultsDropdown(drinksList) {
  resultsSelect.innerHTML = '';
  
  // Zeigt die Gesamtanzahl im Label an
  resultsCountLabel.textContent = currentLang === 'de'
    ? `Ergebnisliste (${drinksList.length} gefunden):`
    : `Results (${drinksList.length} found):`;

  drinksList.forEach(drink => {
    const option = document.createElement('option');
    option.value = drink.idDrink;
    option.textContent = drink.strDrink;
    resultsSelect.appendChild(option);
  });
}

// Live-Suchfeld filtert die Liste während des Tippens
filterResultsInput.addEventListener('input', () => {
  const searchTerm = filterResultsInput.value.toLowerCase().trim();
  const filtered = allFetchedDrinks.filter(drink => 
    drink.strDrink.toLowerCase().includes(searchTerm)
  );
  updateResultsDropdown(filtered);
});


// =========================================================
// 6. SCHRITT 2 -> SCHRITT 3 (REZEPT MIT GLAS, ZUTATEN & ANLEITUNG)
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

    renderRecipe(drink);

    step2.classList.add('hidden');
    step3.classList.remove('hidden');
  } catch (error) {
    alert('Fehler beim Laden des Rezepts.');
  }
});

// Baut die komplette Rezept-Karte zusammen (Glas -> Zutaten -> Anleitung)
function renderRecipe(drink) {
  // 1. ZUTATEN & MENGEN AUS DEM JSON FILTERN (Schleife 1 bis 15 für E4)
  let ingredientsHTML = '';
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    // Nur hinzufügen, wenn das Feld nicht leer / null ist
    if (ingredient && ingredient.trim() !== '') {
      const amount = measure ? measure.trim() : '';
      ingredientsHTML += `<li><strong>${amount}</strong> ${ingredient.trim()}</li>`;
    }
  }

  // 2. ANLEITUNG IN GEWÄHLTER SPRACHE WÄHLEN (DE falls vorhanden, sonst EN)
  let rawInstructions = drink.strInstructions || '';
  if (currentLang === 'de' && drink.strInstructionsDE) {
    rawInstructions = drink.strInstructionsDE;
  }

  // Anleitung an Punkten in einzelne Schritte aufteilen
  const stepsArray = rawInstructions
    .split('.')
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);

  const stepsListHTML = stepsArray
    .map(step => `<li>${step}.</li>`)
    .join('');

  // 3. ALLES IN SCHRITT 3 EINFÜGEN (Zuerst Glas, dann Zutaten, dann Anleitung)
  recipeResult.innerHTML = `
    <div class="recipe-card">
      <h3>${drink.strDrink}</h3>
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">

      <!-- Glas -->
      <div class="glass-info">
        ${translations[currentLang].glassTitle} ${drink.strGlass || 'Standard'}
      </div>

      <!-- Zutaten -->
      <h4>${translations[currentLang].ingredientsTitle}</h4>
      <ul class="ingredients-list">
        ${ingredientsHTML}
      </ul>

      <!-- Schritt-für-Schritt Anleitung -->
      <h4>${translations[currentLang].instructionsTitle}</h4>
      <ol class="instruction-list">
        ${stepsListHTML}
      </ol>
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
  // Wenn wir über "Random" kamen, gehen wir direkt zurück zu Schritt 1
  if (cameFromRandom) {
    step1.classList.remove('hidden');
  } else {
    step2.classList.remove('hidden');
  }
});