// Use the API_URL variable to make fetch requests to the API.
const cohortName = "2306-FSA-ET-WEB-FT-SF";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;
const main = document.querySelector(`main`);

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${API_URL}/players`);
    const result = await response.json();
    return result.data.players;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}`);
    const result = await response.json();
    return result.data.player;
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${API_URL}/players`, {
      method: "POST",
      body: JSON.stringify(playerObj),
      headers: {
        "Content-Type" : "application.json"
      }
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/${playerId}`, {
      method: "DELETE"
    });
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
  try {
    main.innerHTML = ``;
    playerList.forEach((player) => {
      console.log(player.name)
      const playerCard = document.createElement(`div`);
      playerCard.innerHTML = `
      <p>Name: ${player.name}</p>
      <p> Breed: ${player.breed}</p>
      <p>Status: ${player.status}</p>
      <img src="${player.imageUrl}" alt="${player.name}" />
      <p> Team: ${player.teamId}</p>
      <button id="see-details" data-id="${player.id}">See Details</button>
      <button id="delete" data-id="${player.id}">Remove from roster</button>
      `;
      main.appendChild(playerCard);

    });

    seeDetails = document.querySelector(`#see-details`);
    seeDetails.addEventListener(`click`, (event) => {
      playerId = event.target.dataset.id;
      renderSinglePlayer(playerId);
    });
  } catch (err) {
    console.error(`You silly goose, there is an error in renderAllPlayers: `, err);
  }
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = async (id) => {

  const player = await fetchSinglePlayer(id);

  main.innerHTML = ``;
  const playerCard = document.createElement(`div`);
  playerCard.innerHTML = `
  <p>${player.name}</p>
  <p>${player.breed}</p>
  <p>${player.status}</p>
  <img src="${player.imageUrl}" alt="${player.name}" />
  <p>${player.teamId}
  <button id="return">Back to all players</button>
  `;
  main.appendChild(playerCard);

  const returnButton = document.querySelector(`#return`)
  returnButton.addEventListener(`click`, async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);
  })
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  try {
    const newPlayerForm = document.querySelector(`#new-player-form`);
    newPlayerForm.innerHTML = `
    <label for="name">Player Name: </label>
    <input type="text" id="name" name="name">
    <label for="breed">Player Breed: </label>
    <input type="text" id="breed" name="breed">
    <label for="status">Status: </label>
    <input type="radio" id="field" name="status" value="field">
    <label for="field">Field</label>
    <input type="radio" id="bench" name="status" value="bench">
    <label for="bench">Bench</label>
    <label for="img-url">Image URL: </label>
    <input type="text" id="imageUrl" name="imageUrl" >
    <button type="submit" id="add-new-player">Add New Player</button>
    `

    newPlayerForm.addEventListener(`submit`, submitHandler);
  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

const submitHandler = async(event) => {
  event.preventDefault();
  const form = event.target;

  const name = form.name.value;
  const breed = form.breed.value;
  const status = form.status.value;
  const imageUrl = form.imageUrl.value;

  const data = await addNewPlayer({
    name,
    breed,
    status,
    imageUrl,
  });

  if (data) {
    alert(`${data.name} was added to the roster with an ID of ${data.id}`)
  }

  const playerList = await fetchAllPlayers();
  renderAllPlayers(playerList);

form.name.value = ``;
form.breed.value = ``;
form.status.value = ``;
form.imageUrl.value = ``;
}

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);

  renderNewPlayerForm();
};

init();

