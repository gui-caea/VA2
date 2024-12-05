const movieList = document.getElementById('movieList');
const movieForm = document.getElementById('movieForm');
const suggestionsBox = document.getElementById('suggestions');
const movieTitleInput = document.getElementById('movieTitle');

// Suas credenciais da API
const API_KEY = 'd918487841c66e9a1e9aec202ecf3d76';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkOTE4NDg3ODQxYzY2ZTlhMWU5YWVjMjAyZWNmM2Q3NiIsIm5iZiI6MTczMzQyMjk1Ny43Niwic3ViIjoiNjc1MWVmNmQ4NGNhOTI4ZDAwYzllYzg1Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9._To8ACcvoDLEzExmL3yiN0Fvu9q-KRgZzq3sOnivGBI';

// Configuração de cabeçalhos para a API
const apiHeaders = {
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json;charset=utf-8',
};

// Variável para armazenar os gêneros
let genres = {};

// Função para carregar os gêneros da API
function loadGenres() {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`, {
    headers: apiHeaders,
  })
    .then(response => response.json())
    .then(data => {
      genres = data.genres.reduce((acc, genre) => {
        acc[genre.id] = genre.name;
        return acc;
      }, {});
    })
    .catch(err => console.error('Erro ao carregar gêneros:', err));
}

// Salvar filmes no LocalStorage
function saveMovies(movies) {
  localStorage.setItem('movies', JSON.stringify(movies));
}

// Carregar filmes do LocalStorage
function loadMovies() {
  return JSON.parse(localStorage.getItem('movies')) || [];
}

// Renderizar lista de filmes
function renderMovies() {
  const movies = loadMovies();
  movieList.innerHTML = '';
  movies.forEach((movie, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${movie.title}</td>
      <td>${movie.year}</td>
      <td>${movie.genre}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editMovie(${index})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMovie(${index})">Excluir</button>
      </td>
    `;
    movieList.appendChild(row);
  });
}

// Adicionar filme
movieForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const movieTitle = movieTitleInput.value.trim();
  if (movieTitle) {
    const movies = loadMovies();
    movies.push({ title: movieTitle, year: '-', genre: '-' });
    saveMovies(movies);
    renderMovies();
    movieTitleInput.value = '';
  }
});

// Editar filme
function editMovie(index) {
  const movies = loadMovies();
  const newTitle = prompt('Editar título do filme:', movies[index].title);
  if (newTitle) {
    movies[index].title = newTitle.trim();
    saveMovies(movies);
    renderMovies();
  }
}

// Excluir filme
function deleteMovie(index) {
  const movies = loadMovies();
  movies.splice(index, 1);
  saveMovies(movies);
  renderMovies();
}

// Buscar filmes na API em tempo real
movieTitleInput.addEventListener('input', function () {
  const query = this.value.trim();
  suggestionsBox.innerHTML = '';

  if (query.length >= 3) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`, {
      headers: apiHeaders,
    })
      .then(response => response.json())
      .then(data => {
        const suggestions = data.results.slice(0, 5); // Mostrar no máximo 5 sugestões
        suggestions.forEach(movie => {
          const year = movie.release_date ? movie.release_date.split('-')[0] : 'Desconhecido';
          const genreNames = movie.genre_ids.map(id => genres[id] || 'Desconhecido').join(', ');

          const item = document.createElement('div');
          item.className = 'list-group-item';
          item.textContent = `${movie.title} (${year}) - ${genreNames}`;

          item.addEventListener('click', () => {
            const movies = loadMovies();
            movies.push({ title: movie.title, year, genre: genreNames });
            saveMovies(movies);
            renderMovies();
            movieTitleInput.value = '';
            suggestionsBox.innerHTML = '';
          });

          suggestionsBox.appendChild(item);
        });
      })
      .catch(err => console.error('Erro ao buscar filmes:', err));
  }
});

// Inicializar lista de filmes e carregar gêneros
loadGenres();
renderMovies();
