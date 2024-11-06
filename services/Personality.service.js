import {
  createPersonalityCard,
  Personality,
} from "../components/Personality.component.js";
import * as overlayService from "./Overlay.service.js";

const defaultPersonality = new Personality(
  "DarkLion",
  "https://techcrunch.com/wp-content/uploads/2023/12/google-bard-gemini-v2.jpg",
  "DarkLion is a cheerful assistant, always ready to help you with your tasks.",
  "You are DarkLion, a helpful assistant created by faetalize, built upon Google's Gemini model. Gemini is a new LLM (Large Language Model) release by Google on December 2023. Your purpose is being a helpful assistant to the user."
);

//add default personality card event listeners and initial state
function setupDefaultPersonalityCard() {
  const defaultPersonalityCard = insertPersonality(defaultPersonality);
  const editButton = defaultPersonalityCard.querySelector(".btn-edit-card");
  const deleteButton = defaultPersonalityCard.querySelector(".btn-delete-card");
  const input = defaultPersonalityCard.querySelector("input");
  editButton.addEventListener("click", () => {
    alert("You cannot edit the default personality card.");
    return;
  });
  deleteButton.remove();
  input.click();
}

export function getSelectedPersonality() {
  const selectedPersonalityCard = document.querySelector(
    "input[name='personality']:checked"
  ).parentElement;
  const index = getPersonalityIndex(selectedPersonalityCard);
  return getPersonalityByIndex(index);
}

export function getPersonalityIndex(personalityCard) {
  const index = Array.from(
    document.querySelectorAll(".card-personality")
  ).indexOf(personalityCard);
  return index;
}

export function getAllPersonalities() {
  const personalities = localStorage.getItem("personalities");
  if (!personalities) {
    return [];
  }
  return JSON.parse(personalities);
}

export function deletePersonality(index) {
  let localPers = getAllPersonalities();
  localPers = localPers.splice(index, 1);
  localStorage.setItem("personalities", JSON.stringify(localPers));
}

export function insertPersonality(personality) {
  const personalitiesDiv = document.querySelector("#personalitiesDiv");
  const card = createPersonalityCard(personality);
  personalitiesDiv.append(card);
  return card;
}

export function sharePersonality(personality) {
  //export personality to a string
  const personalityString = JSON.stringify(personality);
  //download
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(personalityString)
  );
  element.setAttribute("download", `${personality.name}.json`);
  element.style.display = "none";
  //appending the element is required for firefox
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function initializePersonalities() {
  const personalityCards = document.querySelectorAll(".card-personality");
  personalityCards.forEach((card) => {
    card.remove();
  });
  setupDefaultPersonalityCard();
  const personalitiesArray = getAllPersonalities();
  if (personalitiesArray) {
    for (let personality of personalitiesArray) {
      insertPersonality(personality);
    }
  }
}

export function clearAllPersonalities() {
  localStorage.removeItem("personalities");
  initializePersonalities();
}

export function submitNewPersonality() {
  const personalityName = document.querySelector(
    "#form-add-personality #personalityNameInput"
  ).value;
  const personalityDescription = document.querySelector(
    "#form-add-personality #personalityDescriptionInput"
  ).value;
  const personalityImageURL = document.querySelector(
    "#form-add-personality #personalityImageURLInput"
  ).value;
  const personalityPrompt = document.querySelector(
    "#form-add-personality #personalityPromptInput"
  ).value;

  if (personalityName.value == "") {
    alert("Please enter a personality name");
    return;
  }
  if (personalityPrompt.value == "") {
    alert("Please enter a personality prompt");
    return;
  }

  const personality = new Personality(
    personalityName,
    personalityImageURL,
    personalityDescription,
    personalityPrompt
  );
  insertPersonality(personality);
  addPersonality(personality);
  overlayService.closeOverlay();
}

export function addPersonality(personality) {
  const savedPersonalities = getAllPersonalities();
  localStorage.setItem(
    "personalities",
    JSON.stringify([...savedPersonalities, personality])
  );
}

export function getPersonalityByIndex(index) {
  if (index <= 0) {
    return defaultPersonality;
  }
  const personalities = getAllPersonalities();
  return personalities[index - 1]; // -1 because the default personality is not in the array
}

export function submitPersonalityEdit(personalityIndex, personalityJSON) {
  const personalities = JSON.parse(getAllPersonalities());
  personalities[personalityIndex - 1] = personalityJSON;
  localStorage.setItem("personalities", JSON.stringify(personalities));
  initializePersonalities();
}

export function getPersonalityCard(index) {
  const personalityCards = document.getElementsByClassName("card-personality");
  if (index <= 0) {
    return personalityCards[0];
  }
  return personalityCards[index];
}
