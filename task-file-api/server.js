import http from 'node:http';
import { getTasks, saveTasks, logRequest } from './storage.js';

const PORT = 3000;

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};

const parseJSONBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Некорректный JSON'));
      }
    });
    req.on('error', err => reject(err));
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  await logRequest(method, req.url);

  try {
    if (method === 'GET' && pathname === '/') {
      return sendJSON(res, 200, {
        message: 'Добро пожаловать в Tasks File API',
        endpoints: [
          'GET /',
          'GET /tasks',
          'GET /tasks/completed',
          'GET /tasks/pending',
          'GET /tasks/:id',
          'GET /stats',
          'POST /tasks'
        ]
      });
    }
    if (method === 'GET' && pathname === '/tasks/completed') {
      const tasks = await getTasks();
      const completedTasks = tasks.filter(t => t.completed === true);
      return sendJSON(res, 200, completedTasks);
    }

    if (method === 'GET' && pathname === '/tasks/pending') {
      const tasks = await getTasks();
      const pendingTasks = tasks.filter(t => t.completed === false);
      return sendJSON(res, 200, pendingTasks);
    }

    if (method === 'GET' && pathname === '/stats') {
      const tasks = await getTasks();
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = total - completed;
      return sendJSON(res, 200, { total, completed, pending });

    if (method === 'GET' && pathname === '/tasks') {
      const tasks = await getTasks();
      return sendJSON(res, 200, tasks);
    }


    if (method === 'GET' && pathname.startsWith('/tasks/')) {
      const idStr = pathname.split('/')[2];
      const id = Number(idStr);

      if (isNaN(id)) {
        return sendJSON(res, 400, { error: 'invalid id' });
      }

      const tasks = await getTasks();
      const task = tasks.find(t => t.id === id);

      if (!task) {
        return sendJSON(res, 404, { error: 'not found' });
      }

      return sendJSON(res, 200, task);
    }

    if (method === 'POST' && pathname === '/tasks') {
      let body;
      try {
        body = await parseJSONBody(req);
      } catch (err) {
        return sendJSON(res, 400, { error: 'JSON Error' });
      }

      const { title } = body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return sendJSON(res, 400, { error: 'Write something' });
      }

      const tasks = await getTasks();

      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

      const newTask = {
        id: newId,
        title: title.trim(),
        completed: false
      };

      tasks.push(newTask);
      await saveTasks(tasks);

      return sendJSON(res, 201, newTask);
    }

    return sendJSON(res, 404, { error: 'not found' });

  } catch (error) {
    console.error('server error ', error);
    return sendJSON(res, 500, { error: 'server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
