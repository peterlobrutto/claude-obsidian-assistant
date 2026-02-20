# Obsidian Canvas JSON Reference

Obsidian `.canvas` files are JSON documents with two arrays: `nodes` and `edges`.

## Node Types

### Text Node (inline markdown)
```json
{
  "id": "unique_id",
  "type": "text",
  "text": "## Title\nDescription\n**Bold detail**",
  "x": 0,
  "y": 0,
  "width": 340,
  "height": 120,
  "color": "1"
}
```

### File Node (vault file reference)
```json
{
  "id": "unique_id",
  "type": "file",
  "file": "10-19 Projects/11 Active/11.01 Example Project.md",
  "x": 0,
  "y": 0,
  "width": 340,
  "height": 200
}
```

## Color Codes

| Code | Color | Suggested Use |
|------|-------|---------------|
| `"0"` | Default (gray) | Neutral, labels |
| `"1"` | Red | Core systems, entry points, critical |
| `"2"` | Orange | State management, stores, configs |
| `"3"` | Yellow | Data layer, persistence, warnings |
| `"4"` | Green | UI, output, views, success |
| `"5"` | Cyan | API layer, external services, network |
| `"6"` | Purple | Labels, section headers, metadata |

## Edges

```json
{
  "id": "edge_unique_id",
  "fromNode": "source_node_id",
  "fromSide": "bottom",
  "toNode": "target_node_id",
  "toSide": "top"
}
```

### Side Values
- `"top"`, `"bottom"`, `"left"`, `"right"`
- Vertical flow: `fromSide: "bottom"` → `toSide: "top"`
- Horizontal flow: `fromSide: "right"` → `toSide: "left"`

### Optional Edge Properties
- `"label"`: Text label on the edge
- `"color"`: Same color codes as nodes

## Layout Conventions

- **Spacing**: ~200px vertical gap between layers, ~40px horizontal gap between siblings
- **Standard sizes**: Labels 180x60, content nodes 340x120-200
- **Title node**: Centered at top, larger (400x100)
- **Layer labels**: Left column (x: -40), content right of labels (x: 200+)
- **Flow direction**: Top-to-bottom for architecture, left-to-right for pipelines

## Full Example

```json
{
  "nodes": [
    {
      "id": "title",
      "type": "text",
      "text": "# My App Architecture",
      "x": 100,
      "y": -400,
      "width": 400,
      "height": 80,
      "color": "0"
    },
    {
      "id": "label_ui",
      "type": "text",
      "text": "**UI Layer**",
      "x": -40,
      "y": -250,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "app",
      "type": "text",
      "text": "## App.tsx\nRoot component\nRouting + layout",
      "x": 200,
      "y": -260,
      "width": 340,
      "height": 120,
      "color": "4"
    },
    {
      "id": "label_api",
      "type": "text",
      "text": "**API Layer**",
      "x": -40,
      "y": -50,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "api",
      "type": "text",
      "text": "## API Client\nREST calls\nAuth headers",
      "x": 200,
      "y": -60,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "label_data",
      "type": "text",
      "text": "**Data Layer**",
      "x": -40,
      "y": 150,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "db",
      "type": "text",
      "text": "## Database\nPostgreSQL\nPrisma ORM",
      "x": 200,
      "y": 140,
      "width": 340,
      "height": 120,
      "color": "3"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "fromNode": "app",
      "fromSide": "bottom",
      "toNode": "api",
      "toSide": "top"
    },
    {
      "id": "e2",
      "fromNode": "api",
      "fromSide": "bottom",
      "toNode": "db",
      "toSide": "top"
    }
  ]
}
```
