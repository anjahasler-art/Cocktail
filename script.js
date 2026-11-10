// =========================================================
// 1. HTML-ELEMENTE REFERENZIEREN
// =========================================================


const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

const searchType = document.getElementById('searchType');
const groupName = document.getElementById('groupName');
const groupIngredient = document.getElementById('groupIngredient');
const inputName = document.getElementById('inputName');
const inputIngredient = document.getElementById('inputIngredient');
const feedbackText = document.getElementById('feedbackText');
const resultsSelect = document.getElementById('resultsSelect');
const recipeResult = document.getElementById('recipeResult');

const btnStep1 = document.getElementById('btnStep1');
const btnStep2 = document.getElementById('btnStep2');
const btnBackTo1 = document.getElementById('btnBackTo1');
const btnBackTo2 = document.getElementById('btnBackTo2');


// =========================================================
// 2. REGULÄRE AUSDRÜCKE (E2: Buchstaben & Zahlen erlaubt)
// =========================================================
const regexInput = /^[a-zA-Z0-9äöüÄÖÜßàáâèéê\s-]{2,30}$/;


// =========================================================
// 3. DYNAMISCHES EIN-/AUSBLENDEN DER FELDER
// =========================================================
searchType.addEventListener('change', () => {
  if (searchType.value === 'name') {
    groupName.classList.remove('hidden');
    groupIngredient.classList.add('hidden');
  } else {
    groupIngredient.classList.remove('hidden');
    groupName.classList.add('hidden');
  }
  resetValidation();
});


// =========================================================
// 4. VISUELLES FEEDBACK & VALIDIERUNG
// =========================================================
inputName.addEventListener('input', () => {
  validate(inputName);
});

inputIngredient.addEventListener('input', () => {
  validate(inputIngredient);
});

function validate(inputField) {
  const text = inputField.value.trim();

  // 1. Feld ist leer
  if (text.length === 0) {
    inputField.className = '';
    inputField.setAttribute('aria-invalid', 'false');
    feedbackText.textContent = '';
    feedbackText.className = '';
    return false;
  }

  // 2. Zu kurz oder zu lang
  if (text.length < 2 || text.length > 30) {
    inputField.className = 'invalid';
    inputField.setAttribute('aria-invalid', 'true');
    feedbackText.textContent = '❌ Eingabe muss zwischen 2 und 30 Zeichen lang sein.';
    feedbackText.className = 'text-error';
    return false;
  }

  // 3. Regex-Prüfung (Nur Buchstaben und Zahlen erlaubt)
  if (!regexInput.test(text)) {
    inputField.className = 'invalid';
    inputField.setAttribute('aria-invalid', 'true');
    feedbackText.textContent = '❌ Nur Buchstaben und Zahlen sind gültig.';
    feedbackText.className = 'text-error';
    return false;
  }

  // 4. Gültig
  inputField.className = 'valid';
  inputField.setAttribute('aria-invalid', 'false');
  feedbackText.textContent = '✓ Eingabe gültig';
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
// 5. MULTI-STEP NAVIGATION & API-ABFRAGEN
// =========================================================

btnStep1.addEventListener('click', async () => {
  const isNameMode = searchType.value === 'name';
  const currentInput = isNameMode ? inputName : inputIngredient;
  const searchCategory = isNameMode ? 'Cocktail' : 'Zutat';

  // Eingabe überprüfen
  const isValid = validate(currentInput);
  if (!isValid) {
    return;
  }

  const query = currentInput.value.trim();
  const url = isNameMode
    ? `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    : `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    resultsSelect.innerHTML = '<option value="">-- Bitte wählen --</option>';

    if (data.drinks) {
      data.drinks.forEach(drink => {
        const option = document.createElement('option');
        option.value = drink.idDrink;
        option.textContent = drink.strDrink;
        resultsSelect.appendChild(option);
      });

      // Navigation zu Schritt 2
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
    } else {
      // Spezifische Fehlermeldung bei Nicht-Existenz
      feedbackText.textContent = `❌ ${searchCategory} existiert nicht.`;
      feedbackText.className = 'text-error';
      currentInput.className = 'invalid';
      currentInput.setAttribute('aria-invalid', 'true');
    }
  } catch (error) {
    feedbackText.textContent = '❌ Fehler beim Abfragen der Daten.';
    feedbackText.className = 'text-error';
  }
});


btnStep2.addEventListener('click', async () => {
  const drinkId = resultsSelect.value;

  if (!drinkId) {
    alert('Bitte wähle einen Cocktail aus.');
    return;
  }

  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`);
    const data = await response.json();
    const drink = data.drinks[0];

    // Anleitung in Schritte aufteilen (Sätze an Punkten trennen)
    const rawInstructions = drink.strInstructions || '';
    const stepsArray = rawInstructions
      .split('.')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);

    const stepsListHTML = stepsArray
      .map(step => `<li>${step}.</li>`)
      .join('');

    // HTML für Schritt 3 aufbauen
    recipeResult.innerHTML = `
      <div class="recipe-card">
        <h3>${drink.strDrink}</h3>
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
        <h4>Schritt-für-Schritt Anleitung:</h4>
        <ol class="instruction-list">
          ${stepsListHTML}
        </ol>
      </div>
    `;

    step2.classList.add('hidden');
    step3.classList.remove('hidden');
  } catch (error) {
    alert('Fehler beim Laden des Rezepts.');
  }
});


btnBackTo1.addEventListener('click', () => {
  step2.classList.add('hidden');
  step1.classList.remove('hidden');
});

btnBackTo2.addEventListener('click', () => {
  step3.classList.add('hidden');
  step2.classList.remove('hidden');
});