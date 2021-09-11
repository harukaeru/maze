const board = document.getElementById('board')

STATUS = {
  BLANK: 0,
  FILLED: 1,
  START: 2,
  END: 3,
  CHARACTER: 4,
}

const getHTMLField = (HW) => {
  const getStatus = (v) => v == STATUS.FILLED ? 'cell-filled' : 'cell-blank'

  let rows = ''
  for (let i = 0; i < H; i++) {
    let cells = ''
    for (let j = 0; j < W; j++) {
      let additionalClass = (j == W - 1) ? 'cell-right-last' : ''
      additionalClass += (i == H - 1) ? ' cell-bottom' : ''
      const status = getStatus(HW[i][j])
      const cell = `<div id="pos-${i}-${j}" data-status="${status}" class="cell ${additionalClass}"></div>`
      cells += cell + '\n'
    }
    const row_start = `<div class="row">\n`
    const row_end = `</div>\n`
    rows += row_start + cells + row_end
  }
  return rows
}

const posid = (pos) => `pos-${pos[0]}-${pos[1]}`
const docpos = (pos) => document.getElementById(posid(pos))

const deployStart = (pos) => {
  HW[pos[0]][pos[1]] = STATUS.START
  const e = docpos(pos)
  e.dataset['status'] = 'cell-blank'
  e.innerHTML = '🏠'
}
const deployEnd = (pos) => {
  HW[pos[0]][pos[1]] = STATUS.END
  const e = docpos(pos)
  e.dataset['status'] = 'cell-blank'
  e.innerHTML = '🚩'
}


const H = 20;
const W = 20;

HW = []

for (let i = 0; i < H; i++) {
  HW.push([])
  for (let j = 0; j < W; j++) {
    HW[i][j] = STATUS.BLANK
  }
}


board.innerHTML = getHTMLField(HW)

S = [0, 0]
E = [19, 19]
deployStart(S)
deployEnd(E)

const findRoute = (start) => {
  const distances = []
  for (let i = 0; i < H; i++) {
    distances.push([])
    for (let j = 0; j < W; j++) {
      distances[i][j] = null
    }
  }
  const prev_x = []
  for (let i = 0; i < H; i++) {
    prev_x.push([])
    for (let j = 0; j < W; j++) {
      prev_x[i][j] = null
    }
  }
  const prev_y = []
  for (let i = 0; i < H; i++) {
    prev_y.push([])
    for (let j = 0; j < W; j++) {
      prev_y[i][j] = null
    }
  }

  const q = []
  q.push(start)
  distances[start[0]][start[1]] = 0
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]

  while (q.length > 0) {
    const pos = q.shift()

    for (let i = 0; i < directions.length; i++) {
      const d = directions[i];
      next_pos_0 = pos[0] + d[0]
      next_pos_1 = pos[1] + d[1]
      if (next_pos_0 < 0 || next_pos_0 >= H) {
        continue
      }
      if (next_pos_1 < 0 || next_pos_1 >= W) {
        continue
      }
      const status = HW[next_pos_0][next_pos_1]
      if (status == STATUS.FILLED) {
        continue
      }
      if (distances[next_pos_0][next_pos_1] == null) {
        distances[next_pos_0][next_pos_1] = distances[pos[0]][pos[1]] + 1
        prev_x[next_pos_0][next_pos_1] = pos[0]
        prev_y[next_pos_0][next_pos_1] = pos[1]
        q.push([next_pos_0, next_pos_1])
      }
    }
  }
  return {
    distances,
    prev_x,
    prev_y,
  }
}

const showRoute = (start, end, routeObj) => {
  const routes = []
  let next_pos = end
  routes.push(end)
  let i = 0
  while (true) {
    const x = routeObj.prev_x[next_pos[0]][next_pos[1]]
    const y = routeObj.prev_y[next_pos[0]][next_pos[1]]
    routes.push([x, y])
    next_pos = [x, y]
    if (x == start[0] && y == start[1]) {
      break
    }

    // Error脱出用
    i += 1
    if (i >= 20000) {
      break
    }
  }
  return routes
}

const wait = time => new Promise(resolve => setTimeout(resolve, time))

const run = async (routes) => {
  for (let i = 0; i < routes.length; i++) {
    const pos = routes[i]
    const e = docpos(pos)
    const tmp = e.innerHTML
    e.innerHTML = '🐹'
    if (i == routes.length - 1) {
      break
    }
    await wait(100)
    e.innerHTML = tmp
  }
}

const toggleStatus = (pos) => {
  HW[pos[0]][pos[1]] = HW[pos[0]][pos[1]] == STATUS.FILLED ? STATUS.BLANK : STATUS.FILLED;

  const st = HW[pos[0]][pos[1]] == STATUS.FILLED ? 'cell-filled' : 'cell-blank'
  const e = docpos(pos)
  e.dataset['status'] = st
}

const clickHandler = (e) => {
  console.log(e.target.id)
  const p = e.target.id.split('-')
  const pos = [Number(p[1]), Number(p[2])]
  toggleStatus(pos)
}
document.querySelectorAll('.cell').forEach(elem => {
  elem.addEventListener('click', clickHandler)
})

const go = () => {
  const routeObj = findRoute(S)
  const routes = showRoute(S, E, routeObj)
  routes.reverse()
  run(routes)
}
document.getElementById('go').addEventListener('click', go)
