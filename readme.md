# D&D 2024 AI Toolkit - Project Overview

## Introduction

This is a **Dungeons & Dragons content generation API** powered by Google's Gemini AI. It's a full-stack application that generates D&D content using artificial intelligence, providing Game Masters and players with a quick and creative way to generate characters, items, encounters, and world details.

---

## Architecture: Backend + Frontend

### Backend (Python Flask)

- **Main entry point:** `run.py` - Starts the Flask server on port 5001
- **App initialization:** `app/__init__.py` - Sets up Flask with:
  - SQLAlchemy database (SQLite)
  - CORS support (cross-origin requests)
  - 25+ blueprint routes registered (API endpoints)
  - Frontend static files served from `/frontend`

### Frontend (HTML/JavaScript)

- **Entry point:** `frontend/index.html` - Dashboard with menu cards
- **Pages:** Navigation to 25+ generation pages (e.g., character.html, npc.html, monster.html)
- **JavaScript modules:** `frontend/js/` folder handles API calls and UI interactions
- **Styling:** `frontend/css/styles.css` for responsive design

---

## Project Structure

### Routes (`app/routes/`)

API endpoints organized by D&D content modules:

#### Characters & Actors
- `characters.py` - Player character generation
- `npcs.py` - Non-player character creation
- `monsters.py` - Monster stat generation
- `villains.py` - Antagonist creation

#### World-Building
- `cities.py` - City and location generation
- `shops.py` - Shop and merchant creation
- `inns.py` - Inn and tavern generation
- `factions.py` - Faction and organization creation
- `ruins.py` - Ruins and abandoned place generation

#### Items & Magic
- `items.py` - Item generation
- `spells.py` - Spell creation
- `loot.py` - Treasure and loot tables
- `alchemy.py` - Alchemy recipes and potions

#### Encounters & Adventure
- `encounters.py` - Combat encounter generation
- `adventures.py` - Campaign and adventure ideas
- `quests.py` - Quest and mission creation
- `dungeons.py` - Dungeon layout generation
- `travel.py` - Travel and journey generation

#### Special Features
- `dreams.py` - Dream and vision generation
- `mysteries.py` - Mystery plot generation
- `contracts.py` - Contract and deal creation
- `riddles.py` - Riddle and puzzle generation
- `rules.py` - Custom rule suggestions
- `journal.py` - Journal entry generation
- `librarian.py` - Library and knowledge system
- `history.py` - Historical event generation
- `images.py` - Image generation and management

### Services (`app/services/`)

Business logic layer for each feature:

- Each route has a corresponding service (e.g., `characters.py` → `character_service.py`)
- Services inherit from `BaseService` (defined in `gemini_service.py`)
- Services use **Google Gemini API** to generate content based on user descriptions and parameters
- Services can access library context for consistent D&D mechanics

**Key Service:** `gemini_service.py`
- Base class for all services
- Handles API communication with Google Gemini
- Manages prompt construction and response parsing

### Database Layer

**Models** (`app/models.py`)
- SQLAlchemy ORM models
- Defines database schema for storing generated content

**Configuration** (`app/__init__.py`)
- SQLite database at `dnd_database.sqlite`
- Auto-creates tables on startup

### Data Storage

#### History (`data/`)
JSON history files track all generated content:
- `history_adventure.json` - Adventure generations
- `history_character.json` - Character generations
- `history_spell.json` - Spell generations
- And 19 more history files for other modules

#### Library (`data/library/`)
Reference data folders for D&D mechanics:
- `backgrounds/` - Character background options
- `classes/` - Character class definitions
- `races/` - Playable race definitions
- `items/` - Item templates and lists
- `spells/` - Spell references and templates

### Schemas (`app/schemas/`)

**request.py** - Marshmallow schemas for request validation:
- Validates incoming JSON data
- Ensures required fields are present
- Type-checks request parameters

---

## Configuration

### Environment Setup (`config.py`)

Three configuration modes:
- **Development** - Debug enabled, development settings
- **Production** - Debug disabled, optimized performance
- **Default** - Uses development configuration

### Environment Variables

Loaded from `.env` file:
- `GOOGLE_API_KEY` - Google Gemini API authentication key
- `FLASK_CONFIG` - Configuration mode (default: `development`)

---

## Dependencies

**Backend Requirements** (`requirements.txt`):

```
flask                  # Web framework
flask-restx            # REST API extensions
flask-cors             # Cross-origin request support
python-dotenv          # Environment variable management
google.genai           # Google Gemini API client
marshmallow            # Data validation and serialization
flasgger              # API documentation
Flask-SQLAlchemy      # Database ORM
```

---

## How It Works

### Request Flow

1. **User Action**
   - User navigates to frontend (e.g., `localhost:5001`)
   - Fills out a form with generation parameters

2. **API Call**
   - Frontend JavaScript sends POST request to API endpoint
   - Example: `POST /api/characters/generate`

3. **Request Validation**
   - Route receives request
   - Marshmallow schema validates input data
   - Returns 400 error if validation fails

4. **Content Generation**
   - Service method is called with validated parameters
   - Service constructs prompt using:
     - User input (description, level, preferences)
     - Library context (rules, mechanics, templates)
   - Gemini AI generates content based on prompt

5. **Response**
   - Generated content is formatted as JSON
   - Returned to frontend
   - Optionally saved to history JSON file

6. **Display**
   - Frontend JavaScript displays generated content
   - User can view, edit, or export results

### Example: Character Generation

```
User Input: "Generate a rogue character, level 5"
    ↓
POST /api/characters/generate
    ↓
Route: characters.py validates request
    ↓
Service: character_service.py generates prompt
    ↓
Gemini API: Creates detailed character stats, backstory, skills
    ↓
Response: JSON with character data
    ↓
Frontend: Displays character sheet
    ↓
History: Saved to data/history_character.json
```

---

## API Endpoints

All endpoints follow the pattern: `/api/{module}/{action}`

### Example Endpoints

- `POST /api/characters/generate` - Generate player character
- `POST /api/npcs/generate` - Generate NPC
- `POST /api/spells/generate` - Generate spell
- `POST /api/items/generate` - Generate item
- `POST /api/encounters/generate` - Generate combat encounter
- `POST /api/adventures/generate` - Generate adventure hook
- `POST /api/cities/generate` - Generate city details
- And 17+ more endpoints

---

## Frontend Pages

Located in `frontend/pages/`:

- `character.html` - Player character generator
- `npc.html` - NPC generator
- `monster.html` - Monster laboratory
- `item.html` - Item generator
- `spell.html` - Spell generator
- `encounter.html` - Combat encounter creator
- `adventure.html` - Adventure hook generator
- `city.html` - City generator
- `shop.html` - Shop and merchant creator
- `quest.html` - Quest creator
- And 15+ more pages

---

## Key Features

✨ **AI-Powered Generation**
- Uses Google Gemini API for intelligent content creation
- Context-aware generation based on D&D 5e rules

📚 **Comprehensive Content**
- 25+ types of D&D content generators
- Consistent mechanics and lore

💾 **History Tracking**
- All generations saved to JSON files
- Allows reviewing and rebuilding past creations

🎨 **Web Interface**
- Responsive HTML/CSS/JavaScript frontend
- Easy-to-use generation forms
- Real-time content display

🔗 **RESTful API**
- Standard HTTP endpoints
- JSON request/response format
- CORS enabled for cross-origin requests

🗄️ **Database Support**
- SQLite database integration
- SQLAlchemy ORM for data management

---

## Development

### Running the Server

```bash
python run.py
```

Server starts on `http://localhost:5001`

### Registered Routes

When the server starts, it prints all registered routes:

```
--- RUTAS REGISTRADAS ---
adventures.generate: /api/adventures/generate
characters.generate: /api/characters/generate
...
```

### Adding New Features

To add a new D&D content generator:

1. **Create Route** - `app/routes/newfeature.py`
2. **Create Service** - `app/services/newfeature_service.py`
3. **Create Schema** - Add validation schema to `app/schemas/request.py`
4. **Register Blueprint** - Import and register in `app/__init__.py`
5. **Create Frontend Page** - `frontend/pages/newfeature.html`
6. **Add JavaScript Module** - `frontend/js/newfeature.js`

---

## Project Goals

- 🎲 **Accelerate Game Prep** - Generate D&D content quickly
- 🧠 **AI-Powered Creativity** - Leverage AI for intelligent suggestions
- 🎭 **Rich Content** - Create detailed characters, items, and encounters
- 🛠️ **Easy to Use** - Simple web interface for GMs and players
- 📖 **Consistent Mechanics** - Maintain D&D 5e rules compliance

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, Flask, Flask-SQLAlchemy |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Database** | SQLite |
| **AI/ML** | Google Gemini API |
| **Data Validation** | Marshmallow |
| **API Documentation** | Flasgger |
| **CORS** | Flask-CORS |

---

## File Organization

```
dnd-2024-api/
├── run.py                      # Entry point
├── config.py                   # Configuration
├── requirements.txt            # Python dependencies
├── PROJECT_OVERVIEW.md        # This file
│
├── app/                        # Main application
│   ├── __init__.py            # Flask app initialization
│   ├── models.py              # SQLAlchemy models
│   ├── routes/                # API endpoints (25+ files)
│   ├── services/              # Business logic (25+ files)
│   └── schemas/               # Request validation
│
├── data/                       # Data storage
│   ├── history_*.json         # Generation history
│   └── library/               # Reference data
│
└── frontend/                   # Web interface
    ├── index.html             # Dashboard
    ├── css/                   # Styling
    ├── js/                    # JavaScript modules
    └── pages/                 # Feature pages (25+ files)
```

---

## Summary

The D&D 2024 AI Toolkit is a comprehensive content generation system that combines a Flask backend with Gemini AI to create diverse Dungeons & Dragons content. It provides both an API for programmatic access and a user-friendly web interface for Game Masters and players to quickly generate characters, items, encounters, and world details while maintaining consistency with D&D 5e mechanics.
