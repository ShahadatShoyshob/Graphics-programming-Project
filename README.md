# Graphics Programming (Midterm Coursework) — Snooker Simulation (p5.js + Matter.js)

This repository contains my university **Graphics Programming midterm coursework**: a **snooker / pool table simulation** built with **p5.js** for rendering and **Matter.js** for 2D physics.

The project focuses on:
- real‑time physics simulation (collisions, friction, restitution)
- interactive cue control with mouse input
- multiple gameplay setups (standard / random / practice)
- visual effects and a creative extension using UI sliders

---

## Demo Overview

- **p5.js** draws the table, balls, cue stick and UI.
- **Matter.js** (Engine/World/Bodies) handles movement, collisions and constraints.
- The **cue stick** is controlled with the mouse:
  - **press/drag** to aim and set power (pull‑back distance)
  - **release** to apply force to the cue ball
- Balls can be **potted** into pockets (with a simple entry animation/removal).

---

## Features

### Gameplay / Interaction
- Cue ball placement in the **D zone**
- Mouse-based cue aiming + shot power (drag distance)
- 3 setup modes:
  1. **Default / Standard rack**
  2. **Random clusters** (unpredictable layouts)
  3. **Practice mode** (simplified setup for focused shots)

### Physics (Matter.js)
- Ball-to-ball and ball-to-cushion collisions
- Realistic slowing via friction
- Restitution tuned for snooker-like bounces
- Static cushions and pocket bodies

### Visual Effects
- Ball **trail effect** while moving (recent positions are stored and drawn)
- Pocket entry feedback / animation

### Creative Extension
**Dynamic resizing with sliders**
- Change **ball size**, **cue ball size**, and **pocket size** using on-screen sliders.
- Since Matter.js bodies cannot be resized directly, the project removes old bodies
  and recreates them at the same position with a new radius.

---

## How to Run

This is a browser-based project. For best results (and to avoid browser restrictions), run it using a local server.

### Option A: VS Code Live Server (recommended)
1. Open the folder in **VS Code**
2. Install the **Live Server** extension
3. Right‑click `index.html` → **Open with Live Server**

### Option B: Python local server
From the project folder:
```bash
python -m http.server 8000
```

Then open:
- `http://localhost:8000/Graphics%20programming%20(midterm%20coursework)/index.html`

---

## Controls

- **1** → Default / standard snooker setup  
- **2** → Random clusters setup  
- **3** → Practice setup  
- **Mouse** → Aim & shoot (press/drag/release)
- **Sliders (UI)** → Adjust ball / cue ball / pocket size in real time

---

## Project Files

```
Graphics programming (midterm coursework)/
├─ index.html        # loads p5.js, matter.js, and sketch
├─ p5.min.js         # p5.js library
├─ matter.min.js     # Matter.js library
└─ sketch.js         # main program (rendering, physics, interaction, UI)
```
