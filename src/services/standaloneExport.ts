import type { Level } from "../types/level";

export function buildStandaloneGameHtml(level: Omit<Level, "id" | "createdAt">) {
  const embeddedLevel = JSON.stringify(level).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(level.name || "LevelCrafter Level")}</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#16113f;color:white;font-family:ui-monospace,Menlo,Consolas,monospace}
    main{width:min(92vw,820px);text-align:center}
    h1{text-transform:uppercase;color:#fde047;text-shadow:4px 4px 0 #000}
    .hud{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}
    .chip,.message{border:3px solid #000;background:#12122f;padding:10px;font-weight:900;text-transform:uppercase;box-shadow:4px 4px 0 #000}
    .board{display:inline-grid;gap:4px;border:4px solid #000;background:#000;padding:10px;box-shadow:8px 8px 0 #000}
    .tile{width:min(10vw,56px);aspect-ratio:1;display:grid;place-items:center;border:2px solid #000;font-weight:900;color:#000;box-shadow:inset 3px 3px 0 rgba(255,255,255,.28),inset -3px -3px 0 rgba(0,0,0,.35)}
    button{margin-top:18px;border:4px solid #000;background:#a3e635;padding:12px 18px;font:900 14px ui-monospace,monospace;text-transform:uppercase;box-shadow:5px 5px 0 #000}
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(level.name || "LevelCrafter Level")}</h1>
    <div class="hud">
      <div class="chip" id="moves">Moves: 0</div>
      <div class="chip" id="coins">Coins: 0</div>
      <div class="chip" id="status">Ready</div>
    </div>
    <div class="board" id="board"></div>
    <div class="message">Use arrow keys or WASD. Reach EX.</div>
    <button id="restart">Restart</button>
  </main>
  <script>
    const level = ${embeddedLevel};
    const dynamicTiles = new Set(["enemyHorizontal","enemyVertical","movingHazardHorizontal","movingHazardVertical"]);
    const styles = {empty:"#e9f7ff",wall:"#4b5563",coin:"#ffd83d",hazard:"#ff3d57",enemyHorizontal:"#fb7185",enemyVertical:"#f43f5e",movingHazardHorizontal:"#f97316",movingHazardVertical:"#ea580c",vent:"#7c3aed",player:"#43ff8f",exit:"#39dfff"};
    const icons = {empty:"",wall:"W",coin:"$",hazard:"!",enemyHorizontal:"EH",enemyVertical:"EV",movingHazardHorizontal:"MH",movingHazardVertical:"MV",vent:"VT",player:"P",exit:"EX"};
    let baseGrid, player, movers, moves, coins, won;
    function reset(){
      moves = 0; coins = 0; won = false; movers = [];
      baseGrid = level.grid.map((row,y)=>row.map((tile,x)=>{
        if(tile==="player"){ player={x,y}; return "empty"; }
        if(dynamicTiles.has(tile)){ movers.push({x,y,tile,dx:tile.endsWith("Horizontal")?1:0,dy:tile.endsWith("Vertical")?1:0}); return "empty"; }
        return tile;
      }));
      render("Ready");
    }
    function tileAt(x,y){ if(y<0||y>=level.height||x<0||x>=level.width) return "wall"; return baseGrid[y][x]; }
    function dangerAt(x,y){ return movers.some((m)=>m.x===x&&m.y===y); }
    function moveMover(m){
      let nx=m.x+m.dx, ny=m.y+m.dy;
      if(tileAt(nx,ny)==="wall" || dangerAt(nx,ny)){ m.dx*=-1; m.dy*=-1; nx=m.x+m.dx; ny=m.y+m.dy; }
      if(tileAt(nx,ny)!=="wall" && !dangerAt(nx,ny)){ m.x=nx; m.y=ny; }
    }
    function ventDestination(entryX,entryY){
      const vents = [];
      for(let y=0;y<level.height;y++) for(let x=0;x<level.width;x++){
        if(baseGrid[y][x]==="vent") vents.push({x,y});
      }
      if(vents.length<2) return {x:entryX,y:entryY};
      const index = vents.findIndex((vent)=>vent.x===entryX&&vent.y===entryY);
      return index===-1 ? {x:entryX,y:entryY} : vents[(index+1)%vents.length];
    }
    function step(dx,dy){
      if(won) return;
      const nx=player.x+dx, ny=player.y+dy, tile=tileAt(nx,ny);
      if(tile==="wall"){ render("Blocked"); return; }
      moves++;
      if(tile==="hazard" || dangerAt(nx,ny)){ reset(); render("Restart"); return; }
      player=tile==="vent" ? ventDestination(nx,ny) : {x:nx,y:ny};
      if(tile==="coin"){ coins++; baseGrid[ny][nx]="empty"; }
      if(tile==="exit"){ won=true; render("You win"); return; }
      movers.forEach(moveMover);
      if(dangerAt(player.x,player.y)){ reset(); render("Restart"); return; }
      render(tile==="coin" ? "Coin" : tile==="vent" ? "Vent" : "Go");
    }
    function render(status){
      document.getElementById("moves").textContent = "Moves: " + moves;
      document.getElementById("coins").textContent = "Coins: " + coins;
      document.getElementById("status").textContent = status;
      const board = document.getElementById("board");
      board.style.gridTemplateColumns = "repeat(" + level.width + ", 1fr)";
      board.innerHTML = "";
      for(let y=0;y<level.height;y++) for(let x=0;x<level.width;x++){
        const mover = movers.find((m)=>m.x===x&&m.y===y);
        const tile = player && player.x===x && player.y===y ? "player" : mover ? mover.tile : baseGrid[y][x];
        const cell = document.createElement("div");
        cell.className = "tile"; cell.style.background = styles[tile]; cell.textContent = icons[tile];
        board.appendChild(cell);
      }
    }
    addEventListener("keydown",(event)=>{
      const key = event.key.toLowerCase();
      if(key==="arrowup"||key==="w") step(0,-1);
      if(key==="arrowdown"||key==="s") step(0,1);
      if(key==="arrowleft"||key==="a") step(-1,0);
      if(key==="arrowright"||key==="d") step(1,0);
    });
    document.getElementById("restart").addEventListener("click", reset);
    reset();
  </script>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}
