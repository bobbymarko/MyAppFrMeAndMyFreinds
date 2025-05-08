# MyApp Admin Dashboard

A React-based admin dashboard featuring games and administrative tools.

## Features

- Admin authentication system
- User management
- Order management
- Price calculator
- Games section
  - Target Game
  - Godot Game
- Responsive design

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd myapptry2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Technologies Used

- React
- Vite
- AWS DynamoDB
- Godot Engine (for game development)

## Project Structure

- `/src` - React source code
  - `/components` - Reusable React components
  - `/pages` - Page components
  - `/aws-config.js` - AWS configuration
- `/public` - Static assets
  - `/games` - Game files
    - `/godot-game` - Godot game exports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
