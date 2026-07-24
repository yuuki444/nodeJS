import http from 'node:http';

const PORT = 3000;

const movies = [
  { id: 1, title: "Интерстеллар", genre: "Фантастика", year: 2014, rating: 8.7 },
  { id: 2, title: "Escape the backrooms", genre: "Фантастика", year: 2026, rating: 8.8 },
  { id: 3, title: "Тoy story 5", genre: "Приключения", year: 2026, rating: 9.0 },
  { id: 4, title: "Toy story 4", genre: "Приключения", year: 2019, rating: 7.3 },
  { id: 5, title: "Один Дома", genre: "Комедия", year: 1990, rating: 8.9 }
];

const halls = [
  { id: 1, name: "Зал 1", seats: 120 },
  { id: 2, name: "Зал 2", seats: 30 },
  { id: 3, name: "Зал 3", seats: 80 }
];

const schedule = [
  { id: 1, movieId: 1, hallId: 1, time: "14:00", price: 450 },
  { id: 2, movieId: 2, hallId: 2, time: "17:30", price: 800 },
  { id: 3, movieId: 3, hallId: 3, time: "20:00", price: 350 }
];


const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const url = new URL(req.url, `http://${req.headers.host}`).pathname;


  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: "Метод не поддерживается" }));
  }

  switch (url) {
    case '/':
      res.statusCode = 200;
      res.end(JSON.stringify({
        message: "WELCOME TO THE CINEMA"
      }));
      break;

    case '/movies':
      res.statusCode = 200;
      res.end(JSON.stringify({
        count: movies.length,
        data: movies
      }));
      break;

    case '/halls':
      res.statusCode = 200;
      res.end(JSON.stringify({
        count: halls.length,
        data: halls
      }));
      break;

    case '/schedule':
      res.statusCode = 200;
      res.end(JSON.stringify({
        count: schedule.length,
        data: schedule
      }));
      break;

    case '/about':
      res.statusCode = 200;
      res.end(JSON.stringify({
        name: "Cinema API",
        version: "1.0.0",
        description: "PURE NODE JS!!!!"
      }));
      break;

    case '/stats': {
      const totalRating = movies.reduce((sum, movie) => sum + movie.rating, 0);
      const averageRating = Number((totalRating / movies.length).toFixed(1));

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        data: {
          moviesCount: movies.length,
          hallsCount: halls.length,
          averageRating: averageRating
        }
      }));
      break;
    }

    default:
      res.statusCode = 404;
      res.end(JSON.stringify({
        success: false,
        error: "NOT FOUND 404"
      }));
      break;
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
