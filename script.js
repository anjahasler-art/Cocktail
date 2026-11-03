// =========================================================
// 1. HTML-ELEMENTE REFERENZIEREN
// =========================================================
// Schritt-Container
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

// Eingabefelder & Steuerung
const searchType = document.getElementById('searchType');
const groupName = document.getElementById('groupName');
const groupIngredient = document.getElementById('groupIngredient');
const inputName = document.getElementById('inputName');
const inputIngredient = document.getElementById('inputIngredient');
const feedbackText = document.getElementById('feedbackText');
const resultsSelect = document.getElementById('resultsSelect');
const recipeResult = document.getElementById('recipeResult');

// Buttons
const btnStep1 = document.getElementById('btnStep1');
const btnStep2 = document.getElementById('btnStep2');
const btnBackTo1 = document.getElementById('btnBackTo1');
const btnBackTo2 = document.getElementById('btnBackTo2');


// =========================================================
// 2. DYNAMISCHES EIN-/AUSBLENDEN DER FELDER
// =========================================================
// Reagiert, wenn der Benutzer im ersten Dropdown die Suchart ändert
searchType.addEventListener('change', () => {
  if (searchType.value === 'name') {
    groupName.classList.remove('hidden');       // Name anzeigen
    groupIngredient.classList.add('hidden');    // Zutat verstecken
  } else {
    groupIngredient.classList.remove('hidden'); // Zutat anzeigen
    groupName.classList.add('hidden');          // Name verstecken
  }
  resetValidation(); // Validierung beim Umschalten zurücksetzen
});


// =========================================================
// 3. VISUELLES FEEDBACK & VALIDIERUNG
// =========================================================
// Prüft bei jeder Tastatureingabe im Namensfeld
inputName.addEventListener('input', () => {
  validate(inputName);
});

// Prüft bei jeder Tastatureingabe im Zutatenfeld
inputIngredient.addEventListener('input', () => {
  validate(inputIngredient);
});

// Funktion zur Auswertung der Eingabe (mindestens 2 Zeichen)
function validate(inputField) {
  const text = inputField.value.trim();

  if (text.length === 0) {
    // Feld ist leer -> Standardsituation
    inputField.className = '';
    feedbackText.textContent = '';
  } else if (text.length < 2) {
    // Zu kurz -> Rot (Ungültig)
    inputField.className = 'invalid';
    feedbackText.textContent = '❌ Bitte mindestens 2 Zeichen eingeben.';
    feedbackText.style.color = 'red';
  } else {
    // Lang genug -> Grün (Gültig)
    inputField.className = 'valid';
    feedbackText.textContent = '✓ Eingabe gültig';
    feedbackText.style.color = 'green';
  }
}

// Setzt die CSS-Klassen und Nachrichten zurück
function resetValidation() {
  inputName.value = '';
  inputIngredient.value = '';
  inputName.className = '';
  inputIngredient.className = '';
  feedbackText.textContent = '';
}


// =========================================================
// 4. MULTI-STEP NAVIGATION & API-ABFRAGEN
// =========================================================

// --- SCHRITT 1 -> SCHRITT 2 (Suchanfrage an API) ---
btnStep1.addEventListener('click', async () => {
  // Entscheiden, welches Feld gelesen werden soll
  const isNameMode = searchType.value === 'name';
  const query = isNameMode ? inputName.value.trim() : inputIngredient.value.trim();

  // Abbrechen, wenn das Feld weniger als 2 Zeichen hat
  if (query.length < 2) {
    alert('Bitte gib zuerst einen gültigen Suchbegriff ein.');
    return;
  }

  // API-URL festlegen (Suche nach Name ODER nach Zutat)
  const url = isNameMode
    ? `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`
    : `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${query}`;

  // API-Abfrage durchführen
  const response = await fetch(url);
  const data = await response.json();

  // Dropdown zurücksetzen
  resultsSelect.innerHTML = '<option value="">-- Bitte wählen --</option>';

  // Prüfen, ob Ergebnisse gefunden wurden
  if (data.drinks) {
    // Gefundene Cocktails in das Schritt-2-Dropdown füllen
    data.drinks.forEach(drink => {
      const option = document.createElement('option');
      option.value = drink.idDrink; // Speichert die Cocktail-ID
      option.textContent = drink.strDrink; // Zeigt den Namen an
      resultsSelect.appendChild(option);
    });

    // Navigation zu Schritt 2
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  } else {
    alert('Keine Cocktails gefunden!');
  }
});


// --- SCHRITT 2 -> SCHRITT 3 (Cocktail-Details laden) ---
btnStep2.addEventListener('click', async () => {
  const drinkId = resultsSelect.value;

  // Abbrechen, wenn nichts ausgewählt ist
  if (!drinkId) {
    alert('Bitte wähle einen Cocktail aus.');
    return;
  }

  // API-Abfrage über die ID
  const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`);
  const data = await response.json();
  const drink = data.drinks[0];

  // Ergebnis in Schritt 3 als HTML rendern
  recipeResult.innerHTML = `
    <h3>${drink.strDrink}</h3>
    <img src="${drink.strDrinkThumb}" width="120" alt="${drink.strDrink}">
    <p><strong>Anleitung:</strong> ${drink.strInstructions}</p>
  `;

  // Navigation zu Schritt 3
  step2.classList.add('hidden');
  step3.classList.remove('hidden');
});


// --- ZURÜCK-BUTTONS ---
btnBackTo1.addEventListener('click', () => {
  step2.classList.add('hidden');
  step1.classList.remove('hidden');
});

btnBackTo2.addEventListener('click', () => {
  step3.classList.add('hidden');
  step2.classList.remove('hidden');
});
