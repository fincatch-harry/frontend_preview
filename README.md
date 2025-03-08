# Thread Viewer - Lightweight Website

A clean, responsive website for displaying thread discussions from a JSON data source. This implementation uses vanilla HTML, CSS, and JavaScript with no external dependencies, making it perfect for GitHub Pages hosting.

## Features

- 🌐 Responsive design for mobile, tablet, and desktop
- 🔍 Search functionality across all thread content
- 🏷️ Keyword filtering to show threads by topic
- 📅 Date range filtering to find discussions within specific time periods 
- ⚡ Fast loading with minimal dependencies
- ♿ Accessible design following WCAG standards
- 📱 Mobile-friendly interface

## Setup Instructions

### Quick Start

1. Download all the files in this repository
2. Edit `data.json` with your own thread data (see Data Format section)
3. Upload all files to your GitHub Pages repository
4. Your website will be available at `https://<your-username>.github.io/<repo-name>/`

### Files Included

- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `main.js` - JavaScript functionality
- `data.json` - Sample thread data (replace with your own)
- `README.md` - This documentation file

## Customization

### Basic Customization

1. **Change the title**: Edit the `<title>` tag in `index.html` and the `<h1>` in the header
2. **Update colors**: Modify the color variables in the `:root` section of `style.css`
3. **Adjust layout**: Change spacing and sizing variables in `style.css`

### Advanced Customization

#### Adding New Features

The code is well-documented and follows a modular structure, making it easy to extend:

- To add new filtering options, extend the filter section in `index.html` and implement the logic in `main.js`
- To change the card layout, modify the thread card template in `index.html` and update the related CSS in `style.css`

#### Changing Data Source

By default, the website loads data from a local `data.json` file. You can modify this to load from a different source:

1. Edit the `loadThreadData()` function in `main.js`
2. Update the fetch URL to point to your data source (note: CORS restrictions apply on GitHub Pages)

## Data Format

The website expects JSON data in the following format:

```json
[
  {
    "thread_number": "3691447",
    "post_title": "Thread Title",
    "keyword": "Keyword",
    "username": "Username",
    "replies": [
      {
        "user": "Username",
        "user_id": "431346",
        "time": "2024年5月7日 21:24:39",
        "reply": "Reply text"
      },
      {
        "user": "AnotherUser",
        "user_id": "454665",
        "time": "2024年5月7日 21:25:32",
        "reply": "Another reply"
      }
    ]
  }
]
```

### Data Format Notes

- `thread_number`: Unique identifier for the thread
- `post_title`: Title of the thread
- `keyword`: Category or tag for the thread (used for filtering)
- `username`: Original poster's username
- `replies`: Array of reply objects, each containing:
  - `user`: Username of who wrote the reply
  - `user_id`: Unique identifier for the user
  - `time`: Timestamp of the reply (in format "YYYY年MM月DD日 HH:MM:SS")
  - `reply`: Content of the reply

## Performance Considerations

This website is optimized for GitHub Pages hosting:

- Minimal external dependencies (only loads Font Awesome from CDN)
- Uses modern JavaScript but doesn't require bundling or transpilation
- All assets are static an
