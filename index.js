
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'Pages'));

app.use('/CSS', express.static(path.join(__dirname, 'CSS')));

app.use('/Pages', express.static(path.join(__dirname, 'Pages')));

app.get('/', (req, res) => {
  res.render('mainPage', { title: 'Home Page' });
});

// Example extra route -> Pages/about.ejs
app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});


app.use((req, res) => {
  res.status(404).send('Page not found');
});


app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
