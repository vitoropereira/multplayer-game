// Starting the creation of the game, for those who enter to receive the current data.
export default function createGame() {

  const state = {
    players: {},
    fruits: {},
    screen: {
      width: 10,
      height: 10,
    }
  }

  const observers = []

  function start() {
    const frequency = 10000

    const starting = setInterval(addFruit, frequency)
   
    return starting

  }

  function subscribe(observerFunction) {
    observers.push(observerFunction)

  }

  function notifyAll(command) {
    for (const observerFunction of observers) {
      observerFunction(command)
    }
  }

  function setState(newState) {
    Object.assign(state, newState)

  }

  function addPlayer(command) {
    const playerId = command.playerId
    const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
    const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)

    state.players[playerId] = {
      x: playerX,
      y: playerY
    }

    notifyAll({
      type: 'add-player',
      playerId: playerId,
      playerX: playerX,
      playerY: playerY
    })
  }

  function removePlayer(command) {
    const playerId = command.playerId

    delete state.players[playerId]

    notifyAll({
      type: 'remove-player',
      playerId: playerId
    })
  }

  function addFruit(command) {
    const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
    const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
    const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)

    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY
    }

    notifyAll({
      type: 'add-fruit',
      fruitId: fruitId,
      fruitX: fruitX,
      fruitY: fruitY,
      quantityFruit: state.fruits,
    })
  }

  function removeFruit(command) {
    const fruitId = command.fruitId

    delete state.fruits[fruitId]

    notifyAll({
      type: 'remove-fruit',
      fruitId: fruitId,
    })
  }

  function checkQuantityFruits(command) {
    const screenSize = state.screen.height * state.screen.width
    const quantityFruit = Object.keys(command.quantityFruit).length
    // Screen percentage by quantity of fruits
    const percentageScreenQuantity = (quantityFruit / screenSize) * 100
    if (percentageScreenQuantity >= screenSize * 0.5) {
      notifyAll({
        type: 'lots-fruit',
        quantityFruit,
      })
      console.log('sou maior que 50% da tela.')
    }

    if (percentageScreenQuantity <= screenSize * 0.05) {
      notifyAll({
        type: 'few-fruit',
        quantityFruit,
      })
      console.log('sou menor que 5% da tela.')
    }

    console.log(command.type + ' - ' + percentageScreenQuantity + ' >= ' + screenSize * 0.5)
  }

  function movePlayer(command) {
    notifyAll(command)

    const acceptedMoves = {
      ArrowUp(player) {
        if (player.y - 1 >= 0) {
          player.y = player.y - 1
        }
      },
      ArrowRight(player) {
        if (player.x + 1 < state.screen.width) {
          player.x = player.x + 1
        }
      },
      ArrowDown(player) {
        if (player.y + 1 < state.screen.height) {
          player.y = player.y + 1
        }
      },
      ArrowLeft(player) {
        if (player.x - 1 >= 0) {
          player.x = player.x - 1
        }
      },

    }

    const keyPressed = command.keyPressed
    const playerId = command.playerId
    const player = state.players[command.playerId]
    const moveFunctions = acceptedMoves[keyPressed]

    if (player && moveFunctions) {
      moveFunctions(player)
      checkForFruitCollision(playerId)
    }


    return
  }

  function checkForFruitCollision(playerId) {
    const player = state.players[playerId]

    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId]
      if (player.x === fruit.x && player.y === fruit.y) {

        removeFruit({ fruitId })
      }
    }
  }

  return {
    addPlayer,
    removePlayer,
    addFruit,
    removeFruit,
    movePlayer,
    state,
    setState,
    subscribe,
    start,
    checkQuantityFruits
  }
}